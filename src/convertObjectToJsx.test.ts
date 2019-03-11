import convert from './convertObjectToJsx'

describe('convert', () => {
  describe('single-line values', () => {
    test('Converts non-string non-object primitives', () => {
      expect(convert(`a: 1`)).toEqual(`a={1}`)
      expect(convert(`a: 1,`)).toEqual(`a={1}`)
      expect(convert(`  a: 1\n`)).toEqual(`  a={1}\n`)
      expect(convert(`  a: null,\n`)).toEqual(`  a={null}\n`)
    })

    test('Converts non-template string value', () => {
      expect(convert(`a: 'a'`)).toEqual(`a="a"`)
      expect(convert(`a: "a"`)).toEqual(`a="a"`)
      expect(convert(`trickychars: ' \',"{<}>'`)).toEqual(
        `trickychars=" ',\\"{<}>"`
      )
    })

    test('Converts hyphenated keys', () => {
      expect(convert('`data-test`: `purchase-button`')).toEqual(
        'data-test={`purchase-button`}'
      )
      expect(convert(`"data-test": 'purchase-button'`)).toEqual(
        `data-test="purchase-button"`
      )
      expect(convert(`'data-test': "purchase-button"`)).toEqual(
        `data-test="purchase-button"`
      )
    })

    test('Uses jsx shorthand according to option', () => {
      expect(convert(`a: true`)).toEqual(`a={true}`)
      expect(convert(`a: true`, {useJsxShorthand: true})).toEqual(`a`)
    })

    test('Converts template literal value', () => {
      /* tslint:disable:no-invalid-template-strings */
      expect(convert('a: `string${id}`')).toEqual('a={`string${id}`}')
      /* tslint:enable:no-invalid-template-strings */
    })

    test('Converts field with an object value', () => {
      expect(convert(`a: {z: 1}`)).toEqual(`a={{z: 1}}`)
      expect(convert(`a: {z}`)).toEqual(`a={{z}}`)
    })

    test('Converts ternary value', () => {
      expect(convert(`a: someCondition ? 1 : 2`)).toEqual(
        `a={someCondition ? 1 : 2}`
      )
      expect(convert(`a: 'x' === myString ? 1 : 2`)).toEqual(
        `a={'x' === myString ? 1 : 2}`
      )
    })

    test('Converts object spread', () => {
      expect(convert('  a:1,\n  ...rest,\n  b:2')).toEqual(
        `  a={1}\n  {...rest}\n  b={2}`
      )
      expect(convert('  a:1,\n  ...rest')).toEqual(`  a={1}\n  {...rest}`)
      expect(convert('  ...rest,\n  a:1')).toEqual(`  {...rest}\n  a={1}`)
    })

    test('Converts object spread of function calls', () => {
      expect(
        convert('...myPropGetter({field1: value1, field2: value2})')
      ).toEqual('{...myPropGetter({field1: value1, field2: value2})}')

      expect(
        convert(`
        ...myPropGetter({
          field1: value1,
          field2: value2
        }),
        `)
      ).toEqual(`
        {...myPropGetter({
          field1: value1,
          field2: value2
        })}
        `)
    })

    test('Converts from object shorthand', () => {
      expect(convert('  a,\n  b:b')).toEqual(`  a={a}\n  b={b}`)
      expect(convert('  a:a,\n  b')).toEqual(`  a={a}\n  b={b}`)
      expect(convert('  a,\n  b,\n  c')).toEqual(`  a={a}\n  b={b}\n  c={c}`)
      expect(convert('  x: "x",\n  a,\n  b')).toEqual(
        `  x="x"\n  a={a}\n  b={b}`
      )
    })
  })

  describe('multiline values', () => {
    test('converts multiline ternaries', () => {
      expect(
        convert(`
        fieldWithTernaryValue:
          someReallyLongConditionalCheckReallyReallyReallyLong === undefined
            ? 'option1'
            : 'option2',
        `)
      ).toEqual(`
        fieldWithTernaryValue={
          someReallyLongConditionalCheckReallyReallyReallyLong === undefined
            ? 'option1'
            : 'option2'}
        `)

      expect(
        convert(`
        fieldWithTernaryValue:
          someReallyLongConditionalCheckReallyReallyReallyLong === undefined ? 1 : 2,
        `)
      ).toEqual(`
        fieldWithTernaryValue={
          someReallyLongConditionalCheckReallyReallyReallyLong === undefined ? 1 : 2}
        `)
    })

    test('Handles values with multiline objects', () => {
      expect(
        convert(`
          data: {
            a: {b: {c: 1}},
            meta: {
              x: 'x',
              y: {
                z: '{}'
              }
            },
            g
          },
        `)
      ).toEqual(`
          data={{
            a: {b: {c: 1}},
            meta: {
              x: 'x',
              y: {
                z: '{}'
              }
            },
            g
          }}
        `)
    })
  })

  describe('multiline selections', () => {
    it("preserves entire selection's leading and trailing whitespace", () => {
      expect(convert('\n\n  data: 123  \n\n\n')).toEqual(
        '\n\n  data={123}  \n\n\n'
      )
      /* TODO: fix this case by reworking convert's leadingNewlines regex
      expect(convert('  \n\n  data: 123\n\n\n')).toEqual(
        '  \n\n  data={123}  \n\n\n'
      )
      */
    })

    it('preserves leading/trailing new lines between entries', () => {
      expect(convert('\n\n  data: 123,\n\n  x,\n  y\n')).toEqual(
        '\n\n  data={123}\n\n  x={x}\n  y={y}\n'
      )
    })
  })
})
