const path = require('path')

module.exports = (api) => {
  api.addEnhanceFile({
    client: path.resolve(__dirname, './cookie.js'),
    server: path.resolve(__dirname, './cookie.js'),
    clientModuleName: 'cookie'
  })
}
