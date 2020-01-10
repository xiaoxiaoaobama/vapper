const prettyBytes = require('../lib/PrintStatusPlugin/prettyBytes')

describe('prettyBytes: ', () => {
  test(`Expected failure to pass NEGATIVE_INFINITY`, () => {
    const number = Number.NEGATIVE_INFINITY
    expect(() => prettyBytes(number)).toThrow(new Error(`Expected a finite number, got ${typeof number}: ${number}`))
  })

  test(`Expected failure to pass POSITIVE_INFINITY`, () => {
    const number = Number.POSITIVE_INFINITY
    expect(() => prettyBytes(number)).toThrow(new Error(`Expected a finite number, got ${typeof number}: ${number}`))
  })

  test(`Expected succeed to pass 0 without options.signed`, () => {
    expect(prettyBytes(0)).toBe('0 B')
  })

  test(`Expected succeed to pass 0 with options.signed`, () => {
    expect(prettyBytes(0, { signed: true })).toBe(' 0 B')
  })

  test(`Expected succeed to pass positive integer without options.signed`, () => {
    expect(prettyBytes(1000)).toBe('1 kB')
  })

  test(`Expected succeed to pass negative integer without options.signed`, () => {
    expect(prettyBytes(-1000)).toBe('-1 kB')
  })

  test(`Expected succeed to pass positive integer with options.signed`, () => {
    expect(prettyBytes(1000, { signed: true })).toBe('+1 kB')
  })

  test(`Expected succeed to pass negative integer with options.signed`, () => {
    expect(prettyBytes(-1000, { signed: true })).toBe('-1 kB')
  })

  test(`Expected succeed to pass positive integer with options.locale: zh-u-nu-hanidec`, () => {
    expect(prettyBytes(1000, { locale: 'en' })).toBe('1 kB')
  })

  test(`Expected succeed to pass positive integer with options.locale: true`, () => {
    expect(prettyBytes(1000, { locale: true })).toBe('1 kB')
  })
})
