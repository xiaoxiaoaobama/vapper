module.exports = {
  plugins: [
    [
      '@vapper/plugin-prerender',
      {
        routes: ['/foo']
      }
    ]
  ],
  htmlMinifier: true
}