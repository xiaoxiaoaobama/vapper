module.exports = {
  testRegex: '/__test__/.+\\.(test|spec)\\.js$',
  moduleFileExtensions: ['js', 'json', 'node'],
  moduleNameMapper: {
    '^@vapper/core$': '<rootDir>/packages/core/lib',
    '^@vapper/webpack-config$': '<rootDir>/packages/webpack-config/lib',
    '^@vapper/(.*?)$': '<rootDir>/packages/vapper-$1/lib'
  },
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
}
