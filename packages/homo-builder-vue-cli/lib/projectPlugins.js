module.exports = function (api) {
  const pluginRE = /^(@vue\/|vue-|@[\w-]+\/vue-)cli-plugin-/
  const isPlugin = id => pluginRE.test(id)

  const pkg = require(api.resolveCWD('package.json'))

  const idToPlugin = id => ({
    id: id.replace(/^.\//, 'built-in:'),
    apply: require(api.resolveCWD(`node_modules/${id}`))
  })

  return Object.keys(pkg.devDependencies || {})
    .concat(Object.keys(pkg.dependencies || {}))
    .filter(isPlugin)
    .map(id => {
      if (
        pkg.optionalDependencies &&
            id in pkg.optionalDependencies
      ) {
        let apply = () => {}
        try {
          apply = require(api.resolveCWD(`node_modules/${id}`))
        } catch (e) {
          api.logger.warn(`Optional dependency ${id} is not installed.`)
        }

        return { id, apply }
      } else {
        return idToPlugin(id)
      }
    })
}
