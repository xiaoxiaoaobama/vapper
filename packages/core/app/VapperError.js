/**
 * https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
 */

export default function VapperError (data) {
  const instance = Reflect.construct(Error, {})
  Reflect.setPrototypeOf(instance, Reflect.getPrototypeOf(this))

  instance.name = 'VapperError'

  Object.assign(instance, data)

  return instance
}
VapperError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: Error,
    enumerable: false,
    writable: true,
    configurable: true
  }
})
Reflect.setPrototypeOf(VapperError, Error)
