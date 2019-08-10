const prerender = require('@vapper/plugin-prerender')

module.exports = {
  plugins: [
    [
      prerender,
      {
        routes: ['/bar']
      }
    ]
  ],
  htmlMinifier: true
}