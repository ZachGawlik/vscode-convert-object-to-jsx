import {
  getBeginningWhitespace,
  getEndingWhitespace,
  getEntryStartRegex,
  getPropStartRegex,
} from './utils'

import convertJsxToObject from './convertJsxToObject'
import convertObjectToJsx from './convertObjectToJsx'

const isObjectFormat = (text: string) => {
  const textToSearch = `\n${text}\n`
  const keyIndentation = getBeginningWhitespace(text).length

  const firstKey = textToSearch.search(getEntryStartRegex(keyIndentation))
  const firstProp = textToSearch.search(getPropStartRegex(keyIndentation))
  if (firstKey === 0) {
    return true
  } else if (firstProp === 0) {
    return false
  } else {
    throw new Error(
      'The first line of the selected code is not recognized to be an object entry nor jsx prop'
    )
  }
}

export type Settings = {
  useJsxShorthand?: boolean
}

const convert = (text: string, {useJsxShorthand}: Settings = {}) => {
  const [, leadingNewlines, textWithoutNewlines] = text
    .trimRight()
    .match(/^(\s*\n|)([^]*)$/)!

  return `${leadingNewlines}${
    isObjectFormat(textWithoutNewlines)
      ? convertObjectToJsx(textWithoutNewlines, !!useJsxShorthand)
      : convertJsxToObject(textWithoutNewlines)
  }${getEndingWhitespace(text)}`
}

export default convert
