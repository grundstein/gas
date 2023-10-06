import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { fs, log } from '@grundstein/commons'

import { query } from './lib/index.js'

const cwd = process.cwd()

export const initApi = async config => {
  const { dir } = config

  // some servers might have no api.
  if (!dir) {
    return {}
  }

  const startTime = log.hrtime()

  const api = {
    hosts: {},
  }

  log.info(`@grundstein/gas: serving api from ${dir}`)

  const files = await fs.getFiles(dir)

  await Promise.all(
    files.map(async file => {
      const relativePath = file.replace(dir, '')
      const [_, host, version, ...pathParts] = relativePath.split(path.sep)

      // initialize this api host and version if it does not exist yet
      if (!api.hosts[host]) {
        api.hosts[host] = { [version]: {} }

        let { dataFile } = config
        if (!path.isAbsolute(dataFile)) {
          dataFile = path.join(dir, host, version, dataFile)
        }

        const dataFileExists = await fs.exists(dataFile)
        if (dataFileExists) {
          const urlPath = pathToFileURL(dataFile)
          const { getData } = await import(urlPath)

          let db = await getData()
          let schema

          if (db.db) {
            schema = db.schema
            db = db.db
          }

          api.hosts[host][version].db = db

          if (schema) {
            api.hosts[host][version].schema = schema

            const schemaEntries = Object.entries(schema)

            schemaEntries.forEach(([k, v]) => {
              const searchKeys = []
              const valueEntries = Object.entries(v)
              valueEntries.forEach(([kk, vv]) => {
                if (vv.type === 'string' || vv.type === 'slug') {
                  if (vv.multiple) {
                    searchKeys.push({ key: kk, fuzzy: true })
                  } else {
                    searchKeys.push(kk)
                  }
                } else if (vv.type === 'array' && vv.itemType === 'string') {
                  searchKeys.push(kk)
                } else if (vv.type === 'boolean') {
                  searchKeys.push({ key: kk, boolean: true })
                }
              })

              api.hosts[host][version][`/${k}`] = ({ url }) => {
                /* no query params needed */
                const filtered = query.filter(db[k], url, searchKeys)

                if (!filtered || !filtered.length) {
                  return {
                    code: 404,
                    body: 'Not found',
                  }
                }

                return {
                  code: 200,
                  body: JSON.stringify(filtered),
                  json: true,
                }
              }
            })
          }
        }
      } else if (!api.hosts[host][version]) {
        api.hosts[host][version] = {}
      }

      // get absolute path for import
      const absPath = path.isAbsolute(file) ? file : path.join(cwd, file)

      const { default: lambda } = await import(pathToFileURL(absPath))

      // remove the extension from the lambdapath
      const ext = path.extname(file)
      const lambdaPath = pathParts.join('/').replace(ext, '')

      api.hosts[host][version][`/${lambdaPath}`] = lambda
    }),
  )

  log.timeTaken(startTime, '@grundstein/gas init took')

  return api
}

export default initApi
