const Vapper = require('@vapper/core')
const fs = require('fs-extra')
const Builder = require('../lib/Builder')
const { createBundleRenderer } = require('vue-server-renderer')

jest.mock('fs-extra')
jest.mock('../lib/Builder')
jest.mock('vue-server-renderer')

beforeEach(() => {
  fs.writeFileSync.mockClear()
  Builder.mockClear()
})

describe('Dev mode: ', () => {
  test('Enhance files should be generated correctly', async () => {
    const vapper = new Vapper({ mode: 'development' })
    await vapper.generateEnhanceFile()

    expect(fs.writeFileSync.mock.calls.length).toBe(2)
    expect(fs.writeFileSync.mock.calls[0][0]).toBe(vapper.enhanceClientOutput)
    expect(fs.writeFileSync.mock.calls[0][1]).toMatchSnapshot()
    expect(fs.writeFileSync.mock.calls[1][0]).toBe(vapper.enhanceServerOutput)
    expect(fs.writeFileSync.mock.calls[1][1]).toMatchSnapshot()
  })

  test('Should be built correctly in development mode', async () => {
    const vapper = new Vapper({ mode: 'development' })

    await vapper.build()

    expect(Builder.mockRun.mock.calls.length).toBe(1)

    // createBundleRenderer
    expect(createBundleRenderer.mock.calls.length).toBe(1)
    expect(createBundleRenderer.mock.calls[0][0]).toEqual({}/* serverBundle */)
    expect(createBundleRenderer.mock.calls[0][1]).toEqual({
      runInNewContext: false,
      template: vapper.template,
      clientManifest: {}
    })

    // Listening change event
    expect(Builder.mockOn.mock.calls.length).toBe(1)
    expect(Builder.mockOn).toBeCalledWith('change', expect.any(Function))

    // Dev middlewares
    expect(vapper.devMiddleware).toEqual(Builder.mockDevMiddleware)
    expect(vapper.hotMiddleware).toEqual(Builder.mockHotMiddleware)
  })
})
