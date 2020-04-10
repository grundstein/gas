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

    const clientError = middleware.clientError({ host, port, startTime })
    server.on('clientError', clientError)

    const listener = middleware.listener({ host, port, startTime })
    server.listen(port, host, listener)
  } catch (e) {
    log.error(e)
    process.exit(1)
  }
}

export default run
