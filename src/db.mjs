import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { fs, is, log } from '@grundstein/commons'

export const initDb = async config => {
  const { dir } = config
  let { dbFile } = config

  if (!dbFile) {
    return
  }

  if (!path.isAbsolute(dbFile)) {
    dbFile = path.join(dir, dbFile)
  }

  const ext = path.extname(dbFile)
  if (ext !== '.js' && ext !== '.mjs') {
    dbFile = dbFile + '.js'
  }

  const urlPath = URL.pathToFileURL(maybeDataFile)
  const { db } = await import(urlPath)
  if (is.fn(db)) {
    return await db(config)
  } else {
    return db
  }
}

export default initDb
