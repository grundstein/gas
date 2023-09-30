export default ({ db }) => {
  const { content } = db

  return {
    code: 200,
    body: content,
  }
}
