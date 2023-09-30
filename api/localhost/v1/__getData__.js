export const getData = async () => {
  return await new Promise(r => {
    setTimeout(() => {
      r({
        db: {
          content: 'this is a string coming from the "db"',
        },
        schema: {
          content: { type: 'string' },
        },
      })
    }, 10)
  })
}
