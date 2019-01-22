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
      expect(convertObjectToJsx(`trickychars: 'x "what" huh'`)).toEqual(
        `trickychars="x \\"what\\" huh"`
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
      expect(convertObjectToJsx('  a:1,\n  ...rest')).toEqual(
        `  a={1}\n  {...rest}`
      )
      expect(convertObjectToJsx('  ...rest,\n  a:1')).toEqual(
        `  {...rest}\n  a={1}`
      )
    })

    test.skip('Converts from object shorthand', () => {
      expect(convertObjectToJsx('a,\n b:b')).toEqual(`a="a"\nb="b"`)
      expect(convertObjectToJsx('a:a,\n b')).toEqual(`a="a"\nb="b"`)
      expect(convertObjectToJsx('a:a,\n b\n')).toEqual(`a="a"\nb="b"`)
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
            a: 'a',
            b: 1,
            c
          }
        `)
      ).toEqual(`
          data={{
            a: 'a',
            b: 1,
            c
          }}
        `)

      expect(
        convertObjectToJsx(`
          data: {
            a: 'a',
            b: 1,
            c
          },
          otherProp: 'hello'
        `)
      ).toEqual(`
          data={{
            a: 'a',
            b: 1,
            c
          }}
          otherProp="hello"
        `)
    })

    test('Handles values with multiline nested objects', () => {
      expect(
        convertObjectToJsx(`
          greeting: \`Hello \${name}\`,
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
          greeting={\`Hello \${name}\`}
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
    it('preserves leading/trailing new lines and whitespace', () => {
      expect(convertObjectToJsx('\n\n  data: 123\n\n\n')).toEqual(
        '\n\n  data={123}\n\n\n'
      )
    })
  })
})
