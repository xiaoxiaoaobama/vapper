export function fetch () {
  return new Promise((r, j) => {
    setTimeout(() => {
      j('error')
    }, 200) 
  })
}