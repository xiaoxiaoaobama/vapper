const LRU = require('lru-cache')

module.exports = (
  api,
  {
    cacheOptions = {
      max: 100,
      maxAge: 1000
    },
    cacheable = () => false,
    getCacheKey = req => req.url
  } = {}
) => {
  const microCache = new LRU(cacheOptions)

  let isCacheable = false
  let key = ''

  api.use((req, res, next) => {
    isCacheable = cacheable(req.url)

    if (isCacheable) {
      key = getCacheKey(req)
      const hit = microCache.get(key)

      if (hit) {
        api.logger.debug(`Hit cache, url: ${req.url}`)
        res.setHeader('Content-Type', 'text/html; charset=UTF-8')
        return res.end(hit)
      }
    }
    next()
  })

  api.use('after:render', (req, res, next) => {
    if (isCacheable) {
      microCache.set(key, api.htmlContent)
    }
    next()
  })
}
