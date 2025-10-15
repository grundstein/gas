import { log, lib } from '@grundstein/commons'

const { createServer } = lib

import initApi from './api.js'
import handler from './handler.js'

/**
 * Run the API server
 * @param {import('./api.js').Config} config - Server configuration
 * @returns {Promise<void>}
 */
export const run = async config => {
  try {
    config.startTime = log.hrtime()

    const api = await initApi(config)

    await createServer(config, handler({ api, config }))
  } catch (e) {
    const err = /** @type {import('@magic/error').CustomError} */ (e)
    log.error(err)
    process.exit(1)
  }
}

export { query } from './lib/index.js'

export default run
