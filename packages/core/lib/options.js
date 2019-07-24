module.exports = {
  mode: 'production',
  entry: 'src/main',
  port: 9999,
  logLevel: 5,
  serverBundleFileName: 'vue-ssr-server-bundle.json',
  clientManifestFileName: 'vue-ssr-client-manifest.json'
}
