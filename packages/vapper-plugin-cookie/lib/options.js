const defaultOptions = {
  propertyName: '$cookie'
}

export const getOptions = (pluginRuntimeOptions) => {
  const opts = pluginRuntimeOptions ? (pluginRuntimeOptions.cookie || {}) : {}
  Object.assign(opts, defaultOptions)
  return opts
}
