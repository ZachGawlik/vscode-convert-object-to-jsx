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

const getEntryStartRegex = (keyIndentation: number) => {
  const standardKeyRegex = `\\n {${keyIndentation}}\\w+:`
  const spreadRegex = `\\n {${keyIndentation}}\\.\\.\\.\\w+,\n`
  const shorthandPropRegex = `\\n {${keyIndentation}}\\w+,\n`
  return new RegExp(
    `(${standardKeyRegex}|${spreadRegex}|${shorthandPropRegex})`,
    'g'
  )
}

const getPropStartRegex = (propIndentation: number) => {
  const standardPropRegex = `\\n {${propIndentation}}\\w+=`
  const booleanShorthandRegex = `\\n {${propIndentation}}\\w+\\n`
  const spreadRegex = `\\n {${propIndentation}}\{\.\.\.\\w+\}`
  return new RegExp(
    `(${standardPropRegex}|${booleanShorthandRegex}|${spreadRegex})`,
    'g'
  )
}

// Let's us use `,\n` even on the final entry
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

// tslint:disable-next-line:variable-name
const _jsxifyEntry = (entry: string) => {
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

  // value is already trimmed right.
  return `${key}=${wrapPropValue(value)}`
}

const jsxifyEntry = (untrimmedEntry: string) => {
  return (
    getBeginningWhitespace(untrimmedEntry) +
    _jsxifyEntry(cleanUpTrailingComma(untrimmedEntry.trim())) +
    getEndingWhitespace(untrimmedEntry)
  )
}

const isObjectFormat = (text: string) => {
  const keyIndentation = getBeginningWhitespace(text).length
  const leftmostIndentedKey = getEntryStartRegex(keyIndentation)
  const leftmostIndentedProp = getPropStartRegex(keyIndentation)

  // This is the only time where we're actually matching the "first" entry
  // instead of immediately looking for the second one
  // I don't think there's a case where the index should ever not be 0.

  // TODO: OMGGGGGGGGGGG this actually needs to add a `,` at the end for objs
  //       in the case of only selecting a single field
  // TODO: think through whether I *really* need the , for obj regex
  const textToSearch = `\n${text}\n`

  const firstKey = textToSearch.search(leftmostIndentedKey)
  const firstProp = textToSearch.search(leftmostIndentedProp)
  if (firstKey === -1) {
    return false
  } else if (firstProp === -1) {
    return true
  }

  return firstKey < firstProp
}

const unwrapPropValue = (value: string) => {
  if (isStringValue(value)) {
    return value
  }

  if (value[0] === '{' && value[value.length - 1] === '}') {
    return value.slice(1, value.length - 1)
  }
  throw new Error(
    `Prop value ${JSON.stringify(value)} is neither a string nor expression`
  )
  return
}

const getProps = (text: string) => {
  const propIndentation = getBeginningWhitespace(text).length
  const leftmostIndentedProp = getPropStartRegex(propIndentation)

  const props = []
  let textToSearch = `${text}\n`
  while (true) {
    const nextPropIndex = textToSearch.slice(1).search(leftmostIndentedProp) + 1

    if (nextPropIndex === 0) {
      props.push(textToSearch.trimRight())
      return props
    }
    props.push(textToSearch.slice(0, nextPropIndex))
    textToSearch = textToSearch.slice(nextPropIndex)
  }
}

// tslint:disable-next-line:variable-name
const _propToObject = (prop: string) => {
  const separatorIndex = prop.indexOf('=')

  if (separatorIndex === -1) {
    if (prop.startsWith('{...') && prop[prop.length - 1] === '}') {
      return `${prop.slice(1, prop.length - 1)},`
    }

    return `${prop}: true,`
  }

  const key = prop.slice(0, separatorIndex)
  const value = prop.slice(separatorIndex + 1)
  return `${key}: ${unwrapPropValue(value.trim())},`
}

const propToObject = (prop: string) => {
  return (
    getBeginningWhitespace(prop) +
    _propToObject(prop.trim()) +
    getEndingWhitespace(prop)
  )
}

// tslint:disable-next-line:variable-name
const _convert = (textWithoutNewlines: string) => {
  if (isObjectFormat(textWithoutNewlines)) {
    const objectEntries = getEntries(textWithoutNewlines)

    return objectEntries.map(jsxifyEntry).join('')
  } else {
    const props = getProps(textWithoutNewlines)
    return props.map(propToObject).join('')
  }
}

const convert = (text: string) => {
  const [, leadingNewlines, textWithoutNewlines] = text
    .trimRight()
    .match(/^(\n*)([^]*)$/)!

  return (
    leadingNewlines + _convert(textWithoutNewlines) + getEndingWhitespace(text)
  )
}

export default convert
