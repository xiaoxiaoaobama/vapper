# vue-cli + view-design

## On demand

If you use [view-design](https://iviewui.com/) on demand, you need to ensure that the `nodeExternalsWhitelist` option is configured in `vapper.config.js`:

```js
// vapper.config.js
module.exports = {
  nodeExternalsWhitelist: [/view-design/]
}
```