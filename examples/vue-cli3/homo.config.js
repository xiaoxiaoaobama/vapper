const staticGenerate = require('@homo/plugin-static-generate')

module.exports = {
  generate: {
    routes: ['/foo/bar']
  },
  plugins: [
    [
      staticGenerate,
      {
        routes: ['/foo/bar']
      }
    ]
  ],
  htmlMinifier: true
}