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

  let api = {}

  log.info(`@grundstein/gas: serving api from ${dir}`)

  // const files = await fs.getFiles(dir)
  const dirs = await fs.getDirectories(dir, { minDepth: 1, maxDepth: 1 })
  console.log({ dirs })

  const dirPromises = dirs.map(async apiDir => {
    const absDir = path.join(cwd, apiDir)
    const version = path.basename(apiDir)

    const { dataFile } = config

    api[version] = {}

    try {
      const getDataPath = path.join(cwd, apiDir, dataFile)
      const hasGetDataFile = await fs.exists(getDataPath)
      if (hasGetDataFile) {
        const { getData } = await import(getDataPath)
        const { db, schema } = await getData()

        api[version].db = db

        if (schema) {
          createApiFromSchema({ api, version, db, schema })
        }
      }
    } catch (e) {
      console.log('error creating api from getData', e)
    }

    try {
      const files = await fs.getFiles(absDir)

      console.log({ files })

      const lambdaPromises = files
        .filter(file => !file.endsWith(dataFile))
        .map(async file => {
          console.log(file)
          // get absolute path for import
          const absPath = path.isAbsolute(file) ? file : path.join(cwd, file)

          const { default: lambda } = await import(pathToFileURL(absPath))

          // remove the extension from the lambdapath
          const ext = path.extname(file)
          console.log({ absPath, file })
          const [_, ...pathParts] = file.split(version)
          const lambdaPath = pathParts.join('/').replace(ext, '')

          console.log('registering lambda:', `${version}${lambdaPath}`)
          api[version][lambdaPath] = lambda
        })

      await Promise.all(lambdaPromises)
    } catch (e) {
      console.error('Error loading lambda files', e)
    }
  })

  await Promise.all(dirPromises)

  // if (!path.isAbsolute(dataFile)) {
  //   dataFile = path.join(dir, version, dataFile)
  // }

  // const dataFileExists = await fs.exists(dataFile)
  // console.log('dataFileExists', dataFile, dataFileExists)

  // if (dataFileExists) {
  //   const urlPath = pathToFileURL(dataFile)
  //   const { getData } = await import(urlPath)

  //   let db = await getData()
  //   let schema

  //   if (db.db) {
  //     schema = db.schema
  //     db = db.db
  //   }

  //   const relativePath = dataFile.replace(dir, '')
  //   const [_, version,] = relativePath.split(path.sep)

  //   api[version].db = db

  //   if (schema) {
  //     createApiFromSchema({ api, db, schema })
  //   }
  // }

  // const lambdaPromises = files
  //     .filter(file => file.endsWith(dataFile))
  //     .map(async file => {
  //       const relativePath = file.replace(dir, '')
  //       const [_, version, ...pathParts] = relativePath.split(path.sep)

  //       if (!api.hasOwnProperty(version)) {
  //         api[version] = {}
  //       }

  //       // get absolute path for import
  //       const absPath = path.isAbsolute(file) ? file : path.join(cwd, file)

  //       const { default: lambda } = await import(pathToFileURL(absPath))

  //       // remove the extension from the lambdapath
  //       const ext = path.extname(file)
  //       const lambdaPath = pathParts.join('/').replace(ext, '')

  //       api[version][`/${lambdaPath}`] = lambda
  //     })

  // await Promise.all(lambdaPromises)

  log.timeTaken(startTime, '@grundstein/gas init took')

  return api
}

const createApiFromSchema = ({ api, version, db, schema }) => {
  api[version].schema = schema

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

    api[version][`/${k}`] = ({ url }) => {
      const filtered = query.filter(db[k], url, searchKeys)

      if (!filtered || !filtered.length) {
        return {
          code: 404,
          body: 'Not found',
        }
      }

      return {
        code: 200,
        body: JSON.stringify(filtered).replace(/\n/gim, '\\n'),
        json: true,
      }
    }
  })
}

export default initApi
