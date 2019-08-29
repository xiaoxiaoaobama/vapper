const Vapper = require('@vapper/core')
const { options: defaultOptions } = require('../lib/options')

test('The Vapper class should be instantiated correctly', () => {
  const options = {}
  const vapper = new Vapper(options)

  // options
  expect(vapper.defaultOptions).toEqual(defaultOptions)
})
