
module.exports = function (api) {
  if (api.env('unittest')) {
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
