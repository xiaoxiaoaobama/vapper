import HomoError from './HomoError'

export function redirect (url) {
  throw new HomoError({
    code: 'REDIRECT',
    redirectURL: url
  })
}
