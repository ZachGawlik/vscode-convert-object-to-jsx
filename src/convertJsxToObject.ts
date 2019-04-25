import {
  getBeginningWhitespace,
  getEndingWhitespace,
  getPropStartRegex,
  isStringValue,
} from './utils'

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

const handleHyphen = (key: string) =>
  key.indexOf('-') === -1 ? key : `'${key}'`

// tslint:disable-next-line:variable-name
const _propToObject = (prop: string) => {
  const separatorIndex = prop.indexOf('=')

  if (separatorIndex === -1) {
    if (prop.startsWith('{...') && prop[prop.length - 1] === '}') {
      return `${prop.slice(1, prop.length - 1)},`
    }

    return `${handleHyphen(prop)}: true,`
  }

  const key = prop.slice(0, separatorIndex)
  const value = prop.slice(separatorIndex + 1)
  const formattedValue = unwrapPropValue(value.trim())
  return key === formattedValue
    ? `${key},`
    : formattedValue[0] === '\n'
    ? `${handleHyphen(key)}:${formattedValue},`
    : `${handleHyphen(key)}: ${formattedValue},`
}

const propToObject = (prop: string) => {
  return (
    getBeginningWhitespace(prop) +
    _propToObject(prop.trim()) +
    getEndingWhitespace(prop)
  )
}

export default (textWithoutNewlines: string) => {
  const props = getProps(textWithoutNewlines)
  return props.map(propToObject).join('')
}
