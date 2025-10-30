import { log, createServer } from '@grundstein/commons'

import initApi from './api.js'
import handler from './handler.js'

/**
 * @typedef {object} Config
 * @property {string} [dir]
 * @property {[number, number]} startTime
 */

/**
 *
 * @param {Partial<Config>} config
 */
export const run = async (config = {}) => {
  try {
    /** @type {Config} */
    const fullConfig = {
      startTime: log.hrtime(),
      ...config,
    }

    const api = await initApi(config)

    await createServer(config, handler(api, fullConfig))
  } catch (e) {
    log.error(/** @type {import('@magic/error').CustomError} */ (e))
    process.exit(1)
  }
}

export default run
