import convert from './convertObjectToJsx'

describe('convert', () => {
  describe('single-line values', () => {
    test('Converts non-string non-object primitives', () => {
      expect(convert(`a={1}`)).toEqual(`a: 1,`)
      expect(convert(`  a={null}`)).toEqual(`  a: null,`)
    })

    test('Converts non-template string value', () => {
      expect(convert(`a="a"`)).toEqual(`a: "a",`)

      expect(convert(`trickychars=" ',\\"{<}>"`)).toEqual(
        `trickychars: " ',\\"{<}>",`
      )
    })

    test('Converts hyphenated prop names', () => {
      expect(convert('data-test="purchase-button"')).toEqual(
        `'data-test': "purchase-button",`
      )
    })

    test('Converts template literal value', () => {
      /* tslint:disable:no-invalid-template-strings */
      expect(convert('a={`string${id}`}')).toEqual('a: `string${id}`,')
      /* tslint:enable:no-invalid-template-strings */
    })

    test('Converts field with an object value', () => {
      expect(convert(`a={{z: 1}}`)).toEqual(`a: {z: 1},`)
      expect(convert(`a={{z}}`)).toEqual(`a: {z},`)
    })

    test('Converts object spread', () => {
      expect(convert('  {...rest}')).toEqual('  ...rest,')
    })

    test('Converts object spread of function calls', () => {
      expect(
        convert('{...myPropGetter({field1: value1, field2: value2})}')
      ).toEqual('...myPropGetter({field1: value1, field2: value2}),')
      expect(
        convert(`
        {...myPropGetter({
          field1: value1,
          field2: value2
        })}
        `)
      ).toEqual(`
        ...myPropGetter({
          field1: value1,
          field2: value2
        }),
        `)
    })

    test('Converts to object shorthand', () => {
      expect(convert('  a={a}\n  b={b}')).toEqual(`  a,\n  b,`)
    })

    test('Converts from boolean shorthand', () => {
      expect(convert('  a\n  b')).toEqual(`  a: true,\n  b: true,`)
    })
  })

  describe('multiline selections', () => {
    it("preserves entire selection's leading and trailing whitespace", () => {
      expect(convert('\n\n  data={123}  \n\n\n')).toEqual(
        '\n\n  data: 123,  \n\n\n'
      )
      /* TODO: fix this case by reworking convert's leadingNewlines regex
      expect(convert('  \n\n  data: 123\n\n\n')).toEqual(
        '  \n\n  data={123}  \n\n\n'
      )
      */
    })

    it('preserves leading/trailing new lines between entries', () => {
      expect(
        convert(`
          isLoading={true}


          isVisible

          {...rest}


          data={{
            obj: {
              nested: 'field'
            }
          }}
        `)
      ).toEqual(`
          isLoading: true,


          isVisible: true,

          ...rest,


          data: {
            obj: {
              nested: 'field'
            }
          },
        `)
    })
  })
})
