const prerender = require('@vapper/plugin-prerender')

module.exports = {
  plugins: [
    [
      prerender,
      {
        routes: ['/foo/bar']
      }
    ],
    '@vapper/plugin-cookie'
  ],
  htmlMinifier: true
}