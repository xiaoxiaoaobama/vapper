module.exports = {
  pageCache: {
    cacheOptions: {
      max: 100,
      maxAge: 1000
    },
    cacheable(req) {
      return req.url === '/'
    }
  }
}