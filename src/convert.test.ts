import convert, {Settings} from './convert'

const testReversibleConversion = (
  jsxFormat: string,
  objectFormat: string,
  settings: Settings = {}
): void => {
  expect(convert(jsxFormat, settings)).toEqual(objectFormat)
  expect(convert(objectFormat, settings)).toEqual(jsxFormat)
}

describe('convert', () => {
  describe('single-line values', () => {
    test('Converts non-string non-object primitives', () => {
      testReversibleConversion(`a: 1,`, `a={1}`)
      testReversibleConversion(`  a: null,\n`, `  a={null}\n`)
      expect(convert(`a: 1`)).toEqual(`a={1}`)
      expect(convert(`a: 1`)).toEqual(`a={1}`)
      expect(convert(`  a: 1\n`)).toEqual(`  a={1}\n`)
    })

    test('Converts non-template string value', () => {
      testReversibleConversion(`a: "a",`, `a="a"`)
      expect(convert(`a: 'a'`)).toEqual(`a="a"`)
      expect(convert(`a='a'`)).toEqual(`a: 'a',`)
      expect(convert(`trickychars=" ',\\"{<}>"`)).toEqual(
        `trickychars: " ',\\"{<}>",`
      )
      expect(convert(`trickychars: ' \',"{<}>'`)).toEqual(
        `trickychars=" ',\\"{<}>"`
      )
    })

    test('Converts hyphenated keys', () => {
      testReversibleConversion(
        `'data-test': "purchase-button",`,
        `data-test="purchase-button"`
      )
      testReversibleConversion(
        'hyphenated-boolean-attr',
        "'hyphenated-boolean-attr': true,",
        {useJsxShorthand: true}
      )
      expect(convert('`data-test`: `purchase-button`')).toEqual(
        'data-test={`purchase-button`}'
      )
      expect(convert(`"data-test": 'purchase-button'`)).toEqual(
        `data-test="purchase-button"`
      )
    })

    test('Uses jsx shorthand according to option', () => {
      testReversibleConversion(`a: true,`, `a={true}`)
      testReversibleConversion(`a: true,`, 'a', {useJsxShorthand: true})
      // parsing jsxShorthand does not require outputtingh to shorthand
      expect(convert('  a\n  b')).toEqual(`  a: true,\n  b: true,`)
    })

    test('Converts template literal value', () => {
      /* tslint:disable:no-invalid-template-strings */
      testReversibleConversion('a: `string${id}`,', 'a={`string${id}`}')
      /* tslint:enable:no-invalid-template-strings */
    })

    test('Converts field with an object value', () => {
      testReversibleConversion(`a: {z: 1},`, `a={{z: 1}}`)
      testReversibleConversion(`a: {z},`, `a={{z}}`)
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
      testReversibleConversion('  ...rest,', '  {...rest}')
      testReversibleConversion('  a: 1,\n  ...rest,', `  a={1}\n  {...rest}`)
      testReversibleConversion('  ...rest,\n  a: 1,', `  {...rest}\n  a={1}`)
      testReversibleConversion(
        '  a: 1,\n  ...rest,\n  b: 2,',
        `  a={1}\n  {...rest}\n  b={2}`
      )
    })

    test('Converts object spread of function calls', () => {
      testReversibleConversion(
        '...myPropGetter({field1: value1, field2: value2}),',
        '{...myPropGetter({field1: value1, field2: value2})}'
      )

      testReversibleConversion(
        `
        ...myPropGetter({
          field1: value1,
          field2: value2
        }),
        `,
        `
        {...myPropGetter({
          field1: value1,
          field2: value2
        })}
        `
      )
    })

    test('Converts from object shorthand', () => {
      testReversibleConversion('  a,\n  b,', `  a={a}\n  b={b}`)
      testReversibleConversion('  x: "x",\n  a,', `  x="x"\n  a={a}`)
    })
  })

  describe('multiline values', () => {
    test('converts multiline ternaries', () => {
      testReversibleConversion(
        `
        fieldWithTernaryValue:
          someReallyLongConditionalCheckReallyReallyReallyLong === undefined
            ? 'option1'
            : 'option2',
        `,
        `
        fieldWithTernaryValue={
          someReallyLongConditionalCheckReallyReallyReallyLong === undefined
            ? 'option1'
            : 'option2'}
        `
      )
    })

    test('Handles values with multiline objects', () => {
      testReversibleConversion(
        `
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
        `,
        `
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
        `
      )
    })
  })

  describe('multiline selections', () => {
    it("preserves entire selection's leading and trailing whitespace", () => {
      testReversibleConversion(
        '  \n\n  data: 123,  \n\n\n',
        '  \n\n  data={123}  \n\n\n'
      )
    })

    it('preserves leading/trailing new lines between entries', () => {
      testReversibleConversion(
        '\n\n  data: 123,\n\n  x,\n  y,\n',
        '\n\n  data={123}\n\n  x={x}\n  y={y}\n'
      )
    })
  })

  describe('invalid selections', () => {
    it('throws for component included', () => {
      expect(() =>
        convert(`
        <MyComponent
          prop1={value1}
        />
      `)
      ).toThrowErrorMatchingInlineSnapshot(
        `"The first line of the selected code is not recognized to be an object entry nor jsx prop"`
      )
    })
    it('throws for object braces included', () => {
      expect(() =>
        convert(`
        {
          key1: value1
        }
      `)
      ).toThrowErrorMatchingInlineSnapshot(
        `"The first line of the selected code is not recognized to be an object entry nor jsx prop"`
      )
    })
  })
})
