import { log, lib } from '@grundstein/commons'

import initApi from './api.js'
import handler from './handler.js'

const { createServer } = lib

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
