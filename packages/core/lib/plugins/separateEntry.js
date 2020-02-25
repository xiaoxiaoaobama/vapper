const path = require('path')
const fs = require('fs-extra')

module.exports = function (api) {
  const enhanceObj = {
    needCompile: false
  }

  const clientPath = path.isAbsolute(api.options.clientEntry)
    ? api.options.clientEntry
    : api.resolveCWD(api.options.clientEntry)

  if (fs.pathExistsSync(clientPath)) {
    enhanceObj.client = clientPath
  }

  const serverPath = path.isAbsolute(api.options.serverEntry)
    ? api.options.serverEntry
    : api.resolveCWD(api.options.serverEntry)
  if (fs.pathExistsSync(serverPath)) {
    enhanceObj.server = serverPath
  }

  api.addEnhanceFile(enhanceObj)
}
