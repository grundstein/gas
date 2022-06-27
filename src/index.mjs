import { log } from '@grundstein/commons'

import { createServer } from '@grundstein/commons/lib.mjs'

import initApi from './api.mjs'
import handler from './handler.mjs'

export const run = async (config = {}) => {
  try {
    config.startTime = log.hrtime()

    const api = await initApi(config)

    await createServer(config, handler(api, config))
  } catch (e) {
    log.error(e)
    process.exit(1)
  }
}

export default run
