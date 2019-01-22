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

const getEntries = (text: string) => {
  const keyIndentation = getBeginningWhitespace(text).length
  const leftmostIndentedKey = new RegExp(
    `(\\n {${keyIndentation}}\\w+:|\\n {${keyIndentation}}\\.\\.\\.\\w+$)`,
    'g'
  )

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

const jsxifyEntry = (line: string) => {
  if (line.trimLeft().indexOf('...') === 0) {
    return `${getBeginningWhitespace(line)}{${cleanUpTrailingComma(
      line.trim()
    )}}${getEndingWhitespace(line)}`
  }

  const separatorIndex = line.indexOf(':')
  const key = line.slice(0, separatorIndex)
  const value = line.slice(separatorIndex + 1)

  if (separatorIndex === -1 || !key.trim() || !value.trim()) {
    return line
  }

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

  const objectEntries = getEntries(text.slice(firstNotNewLineChar))

  return `${repeatNewline(firstNotNewLineChar)}${objectEntries
    .map(jsxifyEntry)
    .join('')}${getEndingWhitespace(text)}`
}

export default convert
