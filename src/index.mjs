import https from 'https'

import { log } from '@grundstein/commons'
import * as middleware from '@grundstein/commons/middleware.mjs'
import { getHostCertificates } from '@grundstein/commons/lib.mjs'

import initApi from './api.mjs'
import handler from './handler.mjs'

export const run = async (config = {}) => {
  config.startTime = log.hrtime()

  try {
    const api = await initApi(config)

    const options = await getHostCertificates(config)

    const server = https.createServer(options, handler(api))

    const clientError = middleware.clientError(config)
    server.on('clientError', clientError)

    const listener = middleware.listener(config)
    server.listen(config.port, config.host, listener)
  } catch (e) {
    log.error(e)
    process.exit(1)
  }
}

export default run
