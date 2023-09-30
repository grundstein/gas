import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { fs, log } from '@grundstein/commons'

const cwd = process.cwd()

export const initApi = async config => {
  const { dir } = config

  // some servers might have no api.
  if (!dir) {
    return {}
  }

  const startTime = log.hrtime()

  const api = {}

  log.info(`@grundstein/gas: serving api from ${dir}`)

  let { dataFile } = config
  if (!path.isAbsolute(dataFile)) {
    dataFile = path.join(dir, dataFile)
  }

  const dataFileExists = await fs.exists(dataFile)
  if (dataFileExists) {
    const urlPath = pathToFileURL(dataFile)
    const { getData } = await import(urlPath)
    const { db, schema } = await getData()
    api.db = db
    api.schema = schema
  }

  const files = await fs.getFiles(dir)

  await Promise.all(
    files.map(async file => {
      const relativePath = file.replace(dir, '')
      const [_, host, version, ...pathParts] = relativePath.split(path.sep)

      // initialize this api host and version if it does not exist yet
      api[host] = api[host] || { [version]: {} }

      // get absolute path for import
      const absPath = path.isAbsolute(file) ? file : path.join(cwd, file)

      const { default: lambda } = await import(pathToFileURL(absPath))

      // remove the extension from the lambdapath
      const ext = path.extname(file)
      const lambdaPath = pathParts.join('/').replace(ext, '')

      api[host][version][`/${lambdaPath}`] = lambda
    }),
  )

  log.timeTaken(startTime, '@grundstein/gas init took')

  return api
}

export default initApi
