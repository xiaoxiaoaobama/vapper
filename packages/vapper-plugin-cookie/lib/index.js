const path = require('path')

module.exports = (api, options) => {
  api.addEnhanceFile({
    client: path.resolve(__dirname, './client.js'),
    server: path.resolve(__dirname, './server.js'),
    clientModuleName: 'cookie'
  })
}
