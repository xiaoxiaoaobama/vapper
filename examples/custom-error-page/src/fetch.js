export function fetch () {
  return new Promise((r, j) => {
    setTimeout(() => {
      j(Error('error'))
    }, 200) 
  })
}