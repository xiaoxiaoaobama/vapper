import VapperError from './VapperError'

export function redirect (url) {
  throw new VapperError({
    code: 'REDIRECT',
    redirectURL: url
  })
}
