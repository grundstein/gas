import { log } from '@grundstein/commons'

import { createServer } from '@grundstein/commons/lib.mjs'

import initApi from './api.mjs'
import initDb from './db.mjs'
import handler from './handler.mjs'

export const run = async (config = {}) => {
  try {
    config.startTime = log.hrtime()

    const api = await initApi(config)
    const db = await initDb(config)

    await createServer(config, handler({ api, config, db }))
  } catch (e) {
    log.error(e)
    process.exit(1)
  }
}

export default run
