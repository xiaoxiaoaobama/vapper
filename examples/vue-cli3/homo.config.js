const staticGenerate = require('@homo/plugin-static-generate')

module.exports = {
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