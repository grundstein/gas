export default (req, res) => {
  const random = Math.floor(Math.random() * 1000)
  const body = `hello, world. here is some pseudorandom: ${random}`

  return {
    code: 200,
    body,
  }
}
