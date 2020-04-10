import http from 'http'

import { log, middleware } from '@grundstein/commons'

import initApi from './api.mjs'
import handler from './handler.mjs'

export const run = async (config = {}) => {
  const startTime = log.hrtime()

  const { args = {} } = config

  const { port = 2351, host = '127.0.0.1', dir = 'api' } = args

  try {
    const api = await initApi(dir)

    const server = http.createServer(handler(api))

    server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
    })

    const listener = middleware.listener({ startTime, host, port })
    server.listen(port, host, listener)
  } catch (e) {
    log.error(e)
    process.exit(1)
  }
}

export default run
