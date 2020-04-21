import http from 'http'

import { log } from '@grundstein/commons'
import * as middleware from '@grundstein/commons/middleware.mjs'

import initApi from './api.mjs'
import handler from './handler.mjs'

export const run = async (config = {}) => {
  const startTime = log.hrtime()

  const { dir = 'api', host = '127.0.0.1', port = 2351 } = config

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
