import {
  getBeginningWhitespace,
  getEndingWhitespace,
  getEntryStartRegex,
  isStringValue,
} from './utils'

// Lets us use `,\n` even on the final entry
const sanitizeText = (text: string) => {
  return text[text.length - 1] === ',' ? `${text}\n` : `${text},\n`
}

const getEntries = (text: string) => {
  // is really just looking for spaces. No newlines are here.
  const keyIndentation = getBeginningWhitespace(text).length
  const leftmostIndentedKey = getEntryStartRegex(keyIndentation)

  const entries = []
  let textToSearch = sanitizeText(text)
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
    const stringNoWrappedQuotes = trimmedValue.slice(1, trimmedValue.length - 1)
    // prettier-ignore
    const escapedString = stringNoWrappedQuotes
      .replace(/\\\'/g, "'")
      .replace(/"/g, '\\"')
    return `${beginningWhitespace}"${escapedString}"`
  }

  return `{${beginningWhitespace}${trimmedValue}}`
}

// tslint:disable-next-line:variable-name
const _jsxifyEntry = (entry: string, useJsxShorthand: boolean) => {
  // preserves newlines between object entries
  // could drop that requirement if it simplifies anything
  // realistically, we just need the same amount of spaces as our first one
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

  // value is already trimmed right.
  return `${stripQuotesForHyphen(key)}=${wrapPropValue(value)}`
}

const cleanUpTrailingComma = (s: string) => {
  return s[s.length - 1] === ',' ? s.slice(0, s.length - 1) : s
}

const jsxifyEntry = (untrimmedEntry: string, useJsxShorthand: boolean) => {
  return (
    getBeginningWhitespace(untrimmedEntry) +
    _jsxifyEntry(cleanUpTrailingComma(untrimmedEntry.trim()), useJsxShorthand) +
    getEndingWhitespace(untrimmedEntry)
  )
}

export default (textWithoutNewlines: string, useJsxShorthand: boolean) => {
  const objectEntries = getEntries(textWithoutNewlines)

  return objectEntries
    .map(entry => jsxifyEntry(entry, useJsxShorthand))
    .join('')
}
