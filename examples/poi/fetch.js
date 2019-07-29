export default function fetch () {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: { name: 'hcy' }
      })
    }, 2000)
  })
}