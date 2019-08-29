const prerender = require('@vapper/plugin-prerender')

module.exports = {
  ssr: false,
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