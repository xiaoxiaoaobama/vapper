export function fetch () {
  return new Promise((r, j) => {
    setTimeout(() => {
      const error = Error('error')
      error.code = 200 // For e2e testing purposes only
      j(error)
    }, 200) 
  })
}