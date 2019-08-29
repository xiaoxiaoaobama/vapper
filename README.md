# vapper (WIP)

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## Setup Project

```sh
git clone https://github.com/vapperjs/vapper.git
cd vapper
yarn install
```

## Run E2E test

### 1. link

```sh
cd packages/core
yarn link
```

This makes the `vapper` command globally available.

### 2. run

Projects in the `examples` directory as test fixtures.

Test specified project:

```sh
yarn test [...projectName]
# E.g
yarn test poi vue-cli3
```

Test all project:

```sh
yarn test
```

## Author

**Vapper** © [HcySunYang](https://github.com/HcySunYang), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by HcySunYang.

> [homepage](http://hcysun.me/homepage/) · GitHub [@HcySunYang](https://github.com/HcySunYang) · Twitter [@HcySunYang](https://twitter.com/HcySunYang)