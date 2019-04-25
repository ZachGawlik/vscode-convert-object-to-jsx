export const getBeginningWhitespace = (s: string) => {
  const whitespace = s.match(/^\s+/)
  return whitespace !== null ? whitespace[0] : ''
}

export const getEndingWhitespace = (s: string) => {
  const whitespace = s.match(/\s+$/)
  return whitespace !== null ? whitespace[0] : ''
}

export const isStringValue = (trimmedString: string) =>
  trimmedString[0] === trimmedString[trimmedString.length - 1] &&
  [`'`, `"`].indexOf(trimmedString[0]) !== -1

export const getEntryStartRegex = (keyIndentation: number) => {
  const standardKeyRegex = `\\n {${keyIndentation}}[\`'"-\\w]+:`
  const shorthandPropRegex = `\\n {${keyIndentation}}\\w+,\n`
  const spreadRegex = `\\n {${keyIndentation}}\\.\\.\\.\\w+`
  return new RegExp(
    `(${standardKeyRegex}|${spreadRegex}|${shorthandPropRegex})`,
    'g'
  )
}

export const getPropStartRegex = (propIndentation: number) => {
  const standardPropRegex = `\\n {${propIndentation}}[\\w-]+=`
  const booleanShorthandRegex = `\\n {${propIndentation}}[\\w-]+\\n`
  const spreadRegex = `\\n {${propIndentation}}\\{\\.\\.\\.\\w+`
  return new RegExp(
    `(${standardPropRegex}|${booleanShorthandRegex}|${spreadRegex})`,
    'g'
  )
}
