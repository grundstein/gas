import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { fs, log } from '@grundstein/commons'

import { query } from './lib/index.js'

const cwd = process.cwd()

/**
 * @typedef {Object} Config
 * @property {string} [dir] - API directory path
 * @property {string} dataFile - Name of the data file (e.g., 'getData.js')
 * @property {ReturnType<typeof process.hrtime>} [startTime]
 * @property {string} [corsOrigin]
 * @property {string} [corsHeaders]
 */

/**
 * @typedef {Object} SchemaFieldString
 * @property {'string' | 'slug'} type - Field type
 * @property {boolean} [multiple] - Whether field can have multiple values
 */

/**
 * @typedef {Object} SchemaFieldArray
 * @property {'array'} type - Field type
 * @property {string} itemType - Type of items in array
 */

/**
 * @typedef {Object} SchemaFieldBoolean
 * @property {'boolean'} type - Field type
 */

/**
 * @typedef {SchemaFieldString | SchemaFieldArray | SchemaFieldBoolean} SchemaField
 */

/**
 * @typedef {Record<string, SchemaField>} Schema
 */

/**
 * @typedef {Object} GetDataResult
 * @property {Record<string, any>} db - Database object
 * @property {Schema} [schema] - Database schema
 */

/**
 * @typedef {Object} ApiVersionBase
 * @property {Record<string, any>} [db] - Database instance
 * @property {Schema} [schema] - Database schema
 */

/**
 * @typedef {ApiVersionBase & Record<string, Function>} ApiVersion
 */

/**
 * @typedef {Record<string, Record<string, ApiVersion>>} Api
 */

/**
 * @typedef {Object} LambdaContext
 * @property {URL} url - Parsed URL object
 * @property {string | Object} [body] - Request body
 * @property {Object} [headers] - Request headers
 */

/**
 * @typedef {Object} LambdaResponse
 * @property {number} code - HTTP status code
 * @property {string} body - Response body
 * @property {boolean} [json] - Whether response is JSON
 */

/**
 * Initialize API from directory structure
 * @param {Config} config - Configuration object
 * @returns {Promise<Api>}
 */
export const initApi = async config => {
  const { dir } = config

  // some servers might have no api.
  if (!dir) {
    return {}
  }

  const startTime = log.hrtime()

  /** @type {Api} */
  let api = {}

  log.info(`@grundstein/gas: serving api from ${dir}`)

  const dirs = await fs.getDirectories(dir, { maxDepth: 1, noRoot: true })

  const dirPromises = dirs.map(async apiDir => {
    const absDir = path.join(cwd, apiDir)
    const host = path.basename(apiDir)

    const { dataFile } = config

    api[host] = {}

    const versionDirs = await fs.getDirectories(absDir, { minDepth: 1, maxDepth: 1 })

    const versionPromises = versionDirs.map(async dir => {
      const version = path.basename(dir)

      api[host][version] = {}

      try {
        const getDataPath = path.join(dir, dataFile)
        const hasGetDataFile = await fs.exists(getDataPath)
        if (hasGetDataFile) {
          /** @type {{ getData: () => Promise<GetDataResult> }} */
          const { getData } = await import(getDataPath)
          const { db, schema } = await getData()

          api[host][version].db = db

          if (schema) {
            createApiFromSchema({ api, host, version, db, schema })
          }
        }
      } catch (e) {
        console.log('error creating api from getData', e)
      }

      try {
        const files = await fs.getFiles(absDir)

        const lambdaPromises = files
          .filter(file => !file.endsWith(dataFile))
          .map(async file => {
            // get absolute path for import
            const absPath = path.isAbsolute(file) ? file : path.join(cwd, file)

            /** @type {{ default: (context: LambdaContext) => Promise<LambdaResponse> | LambdaResponse }} */
            const { default: lambda } = await import(pathToFileURL(absPath).pathname)

            // remove the extension from the lambdapath
            const ext = path.extname(file)
            const [_, ...pathParts] = file.split(version)
            const lambdaPath = pathParts.join('/').replace(ext, '')

            api[host][version][lambdaPath] = lambda
          })

        await Promise.all(lambdaPromises)
      } catch (e) {
        console.error('Error loading lambda files', e)
      }
    })

    await Promise.all(versionPromises)
  })

  await Promise.all(dirPromises)

  log.timeTaken(startTime, '@grundstein/gas init took')

  return api
}

/**
 * @typedef {Object} CreateApiFromSchemaParams
 * @property {Api} api - API object to modify
 * @property {string} version - API version
 * @property {string} host - Hostname
 * @property {Record<string, any>} db - Database object
 * @property {Schema} schema - Database schema
 */

/**
 * @typedef {string | { key: string, fuzzy?: boolean, boolean?: boolean }} SearchKey
 */

/**
 * Create API endpoints from schema
 * @param {CreateApiFromSchemaParams} params
 * @returns {void}
 */
const createApiFromSchema = ({ api, version, host, db, schema }) => {
  api[host][version].schema = schema

  const schemaEntries = Object.entries(schema)

  schemaEntries.forEach(([k, v]) => {
    /** @type {SearchKey[]} */
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

    /**
     * @param {LambdaContext} context - Lambda context
     * @returns {LambdaResponse}
     */
    api[host][version][`/${k}`] = ({ url }) => {
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
