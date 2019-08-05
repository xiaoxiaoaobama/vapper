const Joi = require('@hapi/joi')

exports.options = {
  mode: 'production',
  entry: 'src/main',
  port: 4000,
  host: '0.0.0.0',
  logLevel: 5,
  static: {
    dotfiles: 'allow',
    index: false,
    maxAge: '1d'
  },
  plugins: [],
  htmlMinifier: false,
  fallBackSpa: true,
  serverBundleFileName: 'vue-ssr-server-bundle.json',
  clientManifestFileName: 'vue-ssr-client-manifest.json',
  pageCache: {}
}

exports.optionsSchema = Joi.object({
  mode: Joi.string().allow('production', 'development'),
  entry: Joi.string(),
  port: Joi.number(),
  p: Joi.number(),
  host: Joi.string().ip(),
  h: Joi.string().ip(),
  logLevel: Joi.number().min(1).max(5),
  static: Joi.object(),
  plugins: Joi.array().items(
    Joi.array().items(
      Joi.string(),
      Joi.func(),
      Joi.object()
    ),
    Joi.string(),
    Joi.func()
  ),
  htmlMinifier: Joi.alternatives().try(Joi.object(), Joi.boolean()),
  fallBackSpa: Joi.boolean(),
  serverBundleFileName: Joi.string().regex(/^.+\.json$/),
  clientManifestFileName: Joi.string().regex(/^.+\.json$/),
  pageCache: Joi.object({
    cacheOptions: Joi.object(),
    cacheable: Joi.func(),
    getCacheKey: Joi.func()
  })
})
