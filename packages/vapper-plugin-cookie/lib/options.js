const defaultOptions = {
  fromRes: false
}

export const getOptions = (pluginRuntimeOptions) => {
  const opts = pluginRuntimeOptions ? (pluginRuntimeOptions.cookie || {}) : {}
  Object.assign(defaultOptions, opts)
  return opts
}
