const prerender = require('@homo/plugin-prerender')

module.exports = {
  plugins: [
    [
      prerender,
      {
        routes: ['/foo/bar']
      }
    ]
  ],
  htmlMinifier: true
}