import convertObjectToJsx from './convertObjectToJsx'

describe('convertObjectToJsx', () => {
  describe('single-line values', () => {
    test('Converts non-string non-object primitives', () => {
      expect(convertObjectToJsx(`a: 1`)).toEqual(`a={1}`)
      expect(convertObjectToJsx(`a: 1,`)).toEqual(`a={1}`)
      expect(convertObjectToJsx(`  a: 1\n`)).toEqual(`  a={1}\n`)
      expect(convertObjectToJsx(`  a: null,\n`)).toEqual(`  a={null}\n`)
    })

    test('Converts non-template string value', () => {
      expect(convertObjectToJsx(`a: 'a'`)).toEqual(`a="a"`)
      expect(convertObjectToJsx(`a: "a"`)).toEqual(`a="a"`)
      expect(convertObjectToJsx(`trickychars: ' \',"{<}>'`)).toEqual(
        `trickychars=" ',\\"{<}>"`
      )
    })

    test('Converts hyphenated keys', () => {
      expect(convertObjectToJsx('`data-test`: `purchase-button`')).toEqual(
        'data-test={`purchase-button`}'
      )
      expect(convertObjectToJsx(`"data-test": 'purchase-button'`)).toEqual(
        `data-test="purchase-button"`
      )
      expect(convertObjectToJsx(`'data-test': "purchase-button"`)).toEqual(
        `data-test="purchase-button"`
      )
    })

    test('Uses jsx shorthand according to option', () => {
      expect(convertObjectToJsx(`a: true`)).toEqual(`a={true}`)
      expect(convertObjectToJsx(`a: true`, {useJsxShorthand: true})).toEqual(
        `a`
      )
    })

    test('Converts template literal value', () => {
      /* tslint:disable:no-invalid-template-strings */
      expect(convertObjectToJsx('a: `string${id}`')).toEqual(
        'a={`string${id}`}'
      )
      /* tslint:enable:no-invalid-template-strings */
    })

    test('Converts field with an object value', () => {
      expect(convertObjectToJsx(`a: {z: 1}`)).toEqual(`a={{z: 1}}`)
      expect(convertObjectToJsx(`a: {z}`)).toEqual(`a={{z}}`)
    })

    test('Converts ternary value', () => {
      expect(convertObjectToJsx(`a: someCondition ? 1 : 2`)).toEqual(
        `a={someCondition ? 1 : 2}`
      )
      expect(convertObjectToJsx(`a: 'x' === myString ? 1 : 2`)).toEqual(
        `a={'x' === myString ? 1 : 2}`
      )
    })

    test('Converts object spread', () => {
      expect(convertObjectToJsx('  a:1,\n  ...rest,\n  b:2')).toEqual(
        `  a={1}\n  {...rest}\n  b={2}`
      )
      expect(convertObjectToJsx('  a:1,\n  ...rest')).toEqual(
        `  a={1}\n  {...rest}`
      )
      expect(convertObjectToJsx('  ...rest,\n  a:1')).toEqual(
        `  {...rest}\n  a={1}`
      )
    })

    test('Converts from object shorthand', () => {
      expect(convertObjectToJsx('  a,\n  b:b')).toEqual(`  a={a}\n  b={b}`)
      expect(convertObjectToJsx('  a:a,\n  b')).toEqual(`  a={a}\n  b={b}`)
      expect(convertObjectToJsx('  a,\n  b,\n  c')).toEqual(
        `  a={a}\n  b={b}\n  c={c}`
      )
      expect(convertObjectToJsx('  x: "x",\n  a,\n  b')).toEqual(
        `  x="x"\n  a={a}\n  b={b}`
      )
    })
  })

  describe('multiline values', () => {
    test('converts multiline ternaries', () => {
      expect(
        convertObjectToJsx(`
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
        convertObjectToJsx(`
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
        convertObjectToJsx(`
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
      expect(convertObjectToJsx('\n\n  data: 123  \n\n\n')).toEqual(
        '\n\n  data={123}  \n\n\n'
      )
      /* TODO: fix this case by reworking convert's leadingNewlines regex
      expect(convertObjectToJsx('  \n\n  data: 123\n\n\n')).toEqual(
        '  \n\n  data={123}  \n\n\n'
      )
      */
    })

    it('preserves leading/trailing new lines between entries', () => {
      expect(convertObjectToJsx('\n\n  data: 123,\n\n  x,\n  y\n')).toEqual(
        '\n\n  data={123}\n\n  x={x}\n  y={y}\n'
      )
    })
  })
})
