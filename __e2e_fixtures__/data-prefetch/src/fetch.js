export function fetch () {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('bar')
    }, 200) 
  })
}