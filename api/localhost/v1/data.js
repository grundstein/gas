import http2 from 'node:http2'

const { HTTP2_HEADER_AUTHORITY } = http2.constants

export default ({ api, headers }) => {
  const authority = headers[HTTP2_HEADER_AUTHORITY].split(':')[0]
  const { db } = api[authority]
  return {
    code: 200,
    body: JSON.stringify(db.collection),
  }
}
