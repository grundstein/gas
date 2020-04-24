import path from 'path'

import { fs, log } from '@grundstein/commons'

export const initApi = async dir => {
  // some servers might have no api.
  if (!dir) {
    return {}
  }

  const startTime = log.hrtime()

  const cwd = process.cwd()

  log.info(`gs-server/api: serving static files from ${dir}`)

  const files = await fs.getFiles(dir)

  const api = {}

  await Promise.all(
    files.map(async file => {
      const relativePath = file.replace(dir, '')
      const [_, host, version, ...pathParts] = relativePath.split(path.sep)

      // initialize this api host and version if it does not exist yet
      api[host] = api[host] || { [version]: {} }


      // get absolute path for import
      const absPath = path.join(cwd, file)

      const { default: lambda } = await import(absPath)

      // remove the extension from the lambdapath
      const ext = path.extname(file)
      const lambdaPath = pathParts.join('/').replace(ext, '')

      api[host][version][`/${lambdaPath}`] = lambda
    }),
  )

  log.timeTaken(startTime, 'api init took')

  return api
}

export default initApi
