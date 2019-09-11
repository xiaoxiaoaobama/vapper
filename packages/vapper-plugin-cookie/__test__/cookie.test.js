import cookie from '../lib/cookie'
import { createLocalVue } from '@vue/test-utils'

test('cookie', () => {
  const LocalVue = createLocalVue()
  document.cookie = 'foo=1; bar:2'
  cookie({ Vue: LocalVue, pluginRuntimeOptions: {}, type: 'client' })

  const ins = new LocalVue()

  expect(ins.$cookie.get('foo')).toBe('1')
})
