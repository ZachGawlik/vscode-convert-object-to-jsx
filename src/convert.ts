import {
  getBeginningWhitespace,
  getEndingWhitespace,
  getEntryStartRegex,
  getPropStartRegex,
} from './utils'

import convertJsxToObject from './convertJsxToObject'
import convertObjectToJsx from './convertObjectToJsx'

const isObjectFormat = (text: string) => {
  const keyIndentation = getBeginningWhitespace(text).length
  const leftmostIndentedKey = getEntryStartRegex(keyIndentation)
  const leftmostIndentedProp = getPropStartRegex(keyIndentation)

  // This is the only time where we're actually matching the "first" entry
  // instead of immediately looking for the second one
  // I don't think there's a case where the index should ever not be 0.
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

export type Settings = {
  useJsxShorthand?: boolean
}

const convert = (text: string, {useJsxShorthand}: Settings = {}) => {
  const [, leadingNewlines, textWithoutNewlines] = text
    .trimRight()
    .match(/^(\n*)([^]*)$/)!

  return `${leadingNewlines}${
    isObjectFormat(textWithoutNewlines)
      ? convertObjectToJsx(textWithoutNewlines, !!useJsxShorthand)
      : convertJsxToObject(textWithoutNewlines)
  }${getEndingWhitespace(text)}`
}

export default convert
