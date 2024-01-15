import http2 from 'node:http2'

const { HTTP2_HEADER_AUTHORITY } = http2.constants

export default ({ api, db, headers, url, hostname, version }) => {
  return {
    code: 200,
    body: JSON.stringify(db.collection),
  }
}
