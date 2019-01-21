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

const convert = (text: string) => {
  return text
    .split(',\n')
    .map(line => {
      const separatorIndex = line.indexOf(':')
      const key = line.slice(0, separatorIndex)
      const value = line.slice(separatorIndex + 1)

      if (!key.trim() || !value.trim()) {
        return line
      }

      return `${getBeginningWhitespace(key)}${key.trim()}=${wrapPropValue(
        value,
        cleanUpTrailingComma(value.trim())
      )}${getEndingWhitespace(value)}`
    })
    .join('\n')
}

export default convert
