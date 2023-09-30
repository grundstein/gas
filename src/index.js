import { log } from '@grundstein/commons'

import { createServer } from '@grundstein/commons/lib.js'

import initApi from './api.js'
import handler from './handler.js'

export const run = async (config = {}) => {
  try {
    config.startTime = log.hrtime()

    const api = await initApi(config)

    await createServer(config, handler({ api, config }))
  } catch (e) {
    log.error(e)
    process.exit(1)
  }
}

export { query } from './lib/index.js'

export default run
