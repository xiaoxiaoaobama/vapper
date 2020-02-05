# Allows extension of context.state

Open the browser and check that the server-rendered content should include the following:

```js
window.__INITIAL_STATE__ = {
  "$$selfStore": {},
  "foo": 1
}
```