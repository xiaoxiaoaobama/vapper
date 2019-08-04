const prerender = require('@homo/plugin-prerender')

module.exports = {
  plugins: [
    [
      prerender,
      {
        routes: ['/foo']
      }
    ]
  ],
  htmlMinifier: true
}