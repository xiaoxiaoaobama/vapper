export default function fetch (name) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: { name: name || 'vapper' }
      })
    }, 1000)
  })
}