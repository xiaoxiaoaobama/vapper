const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  productionSourceMap: false,
  css: {
    extract: isProd,
    sourceMap: false
  }
}