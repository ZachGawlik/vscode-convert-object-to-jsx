const getBeginningWhitespace = (s: string) => {
  const whitespace = s.match(/^\s+/)
  return whitespace !== null ? whitespace[0] : ''
}

const getEndingWhitespace = (s: string) => {
  const whitespace = s.match(/\s+$/)
  return whitespace !== null ? whitespace[0] : ''
}

const cleanUpTrailingComma = (s: string) => {
  return s[s.length - 1] === ',' ? s.slice(0, s.length - 1) : s
}

const isStringValue = (trimmedString: string) =>
  trimmedString[0] === trimmedString[trimmedString.length - 1] &&
  [`'`, `"`].indexOf(trimmedString[0]) !== -1

const wrapPropValue = (originalValue: string, trimmedString: string) => {
  const beginningWhitespace = getBeginningWhitespace(
    originalValue[0] === ' ' ? originalValue.slice(1) : originalValue
  )
  if (isStringValue(trimmedString)) {
    const stringNoWrappedQuotes = trimmedString.slice(
      1,
      trimmedString.length - 1
    )
    // prettier-ignore
    const escapedString = stringNoWrappedQuotes
      .replace(/\\\'/g, "'")
      .replace(/"/g, '\\"')
    return `${beginningWhitespace}"${escapedString}"`
  }

  return `{${beginningWhitespace}${trimmedString}}`
}

// TODO: might make it easier if I normalized by putting ,\n after final entry
const getEntryStartRegex = (keyIndentation: number) => {
  const standardKeyRegex = `\\n {${keyIndentation}}\\w+:`
  const spreadRegex = `\\n {${keyIndentation}}\\.\\.\\.\\w+,\n`
  const shorthandPropRegex = `\\n {${keyIndentation}}\\w+,\n`
  return new RegExp(
    `(${standardKeyRegex}|${spreadRegex}|${shorthandPropRegex})`,
    'g'
  )
}

// Let's us use `,\n` even on the final entry
const sanitizeText = (text: string) => {
  const sanitizedText = text.trimRight()
  return sanitizedText[sanitizedText.length - 1] === ','
    ? `${sanitizedText}\n`
    : `${sanitizedText},\n`
}

const getEntries = (text: string) => {
  const keyIndentation = getBeginningWhitespace(text).length
  const leftmostIndentedKey = getEntryStartRegex(keyIndentation)

  const entries = []
  let textToSearch = text
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

const jsxifyEntry = (entry: string) => {
  if (entry.trimLeft().indexOf('...') === 0) {
    return `${getBeginningWhitespace(entry)}{${cleanUpTrailingComma(
      entry.trim()
    )}}${getEndingWhitespace(entry)}`
  }

  const separatorIndex = entry.indexOf(':')

  if (separatorIndex === -1) {
    const shorthandPropName = cleanUpTrailingComma(entry.trim())
    return `${getBeginningWhitespace(
      entry
    )}${shorthandPropName}={${shorthandPropName}}${getEndingWhitespace(entry)}`
  }

  const key = entry.slice(0, separatorIndex)
  const value = entry.slice(separatorIndex + 1)

  return `${getBeginningWhitespace(key)}${key.trim()}=${wrapPropValue(
    value,
    cleanUpTrailingComma(value.trim())
  )}${getEndingWhitespace(value)}`
}

const repeatNewline = (num: number) => {
  let str = ''
  for (let i = 0; i < num; i++) {
    str += '\n'
  }
  return str
}

const convert = (text: string) => {
  let firstNotNewLineChar = 0
  while (text[firstNotNewLineChar] === '\n') {
    firstNotNewLineChar += 1
  }

  // TODO: cleanup
  const objectEntries = getEntries(
    sanitizeText(text.slice(firstNotNewLineChar))
  )

  return `${repeatNewline(firstNotNewLineChar)}${objectEntries
    .map(jsxifyEntry)
    .join('')}${getEndingWhitespace(text)}`
}

export default convert
