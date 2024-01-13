export default ({ db }) => {
  return {
    code: 200,
    body: JSON.stringify(db.collection),
  }
}
