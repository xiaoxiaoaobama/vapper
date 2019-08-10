const prerender = require('@vapper/plugin-prerender')

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