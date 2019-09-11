
module.exports = function (api) {
  if (api.env('test')) {
    return {
      presets: [
        ['@babel/env', {
          targets: {
            node: 'current'
          }
        }]
      ]
    }
  }
  return {}
}
