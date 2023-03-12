import {
  getBeginningWhitespace,
  getEndingWhitespace,
  getEntryStartRegex,
  isStringValue,
} from './utils'

const splitEntries = (text: string) => {
  const keyIndentation = getBeginningWhitespace(text).length
  const leftmostIndentedKey = getEntryStartRegex(keyIndentation)

  const entries = []
  // Lets us use `,\n` regex even on the final selected entry
  let textToSearch = text[text.length - 1] === ',' ? `${text}\n` : `${text},\n`
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const nextKeyIndex = textToSearch.slice(1).search(leftmostIndentedKey) + 1

    if (nextKeyIndex === 0) {
      entries.push(textToSearch.trimRight())
      return entries
    }
    entries.push(textToSearch.slice(0, nextKeyIndex))
    textToSearch = textToSearch.slice(nextKeyIndex)
  }
}

const stripQuotesForHyphen = (key: string) =>
  key[0] === key[key.length - 1] &&
  ['"', "'", '`'].indexOf(key[0]) > -1 &&
  key.indexOf('-') > -1
    ? key.slice(1, key.length - 1)
    : key

const wrapPropValue = (untrimmedValue: string) => {
  const beginningWhitespace = getBeginningWhitespace(
    untrimmedValue[0] === ' ' ? untrimmedValue.slice(1) : untrimmedValue
  )
  const trimmedValue = untrimmedValue.trimLeft()
  if (isStringValue(trimmedValue)) {
    const stringContent = trimmedValue.slice(1, trimmedValue.length - 1)
    const escapedString = stringContent
      .replace(/\\'/g, "'")
      .replace(/"/g, '\\"')
    return `${beginningWhitespace}"${escapedString}"`
  }

  return `{${beginningWhitespace}${trimmedValue}}`
}

const jsxifyEntry = (entry: string, useJsxShorthand: boolean) => {
  if (entry.indexOf('...') === 0) {
    return `{${entry}}`
  }

  const separatorIndex = entry.indexOf(':')

  if (separatorIndex === -1) {
    return `${entry}={${entry}}`
  }

  const key = entry.slice(0, separatorIndex)
  const value = entry.slice(separatorIndex + 1)

  if (useJsxShorthand && value === ' true') {
    return stripQuotesForHyphen(key)
  }

  return `${stripQuotesForHyphen(key)}=${wrapPropValue(value)}`
}

const cleanUpTrailingComma = (s: string) => {
  return s[s.length - 1] === ',' ? s.slice(0, s.length - 1) : s
}

export default (text: string, useJsxShorthand: boolean) => {
  return splitEntries(text)
    .map(
      (entry: string) =>
        getBeginningWhitespace(entry) +
        jsxifyEntry(cleanUpTrailingComma(entry.trim()), useJsxShorthand) +
        getEndingWhitespace(entry)
    )
    .join('')
}
