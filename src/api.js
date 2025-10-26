import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { fs, log } from '@grundstein/commons'

/**
 * @typedef {import('http').IncomingMessage} Request
 * @typedef {import('http').ServerResponse} Response
 */

/**
 * Represents a single API function (“lambda”) that handles a request.
 * @typedef {(req: Request, res: Response) => Promise<any> | any} LambdaFn
 */

/**
 * A versioned API map, e.g. `{ "v1": { "/users": fn, "/posts": fn } }`
 * @typedef {Record<string, Record<string, LambdaFn>>} VersionedApi
 */

/**
 * The top-level API map structure, e.g.
 * `{ "example.com": { "v1": { "/foo": fn } } }`
 * @typedef {Record<string, VersionedApi>} Api
 */

/**
 * Configuration for initializing the API.
 * @typedef {{
 *   dir?: string;
 * }} InitConfig
 */

/**
 * Dynamically imports all API modules under a given directory and builds
 * a structured API object keyed by hostname, version, and route path.
 *
 * Directory structure example:
 * ```
 * api/
 * └── example.com/
 *     └── v1/
 *         ├── users.js   -> api["example.com"]["v1"]["/users"]
 *         └── posts.js   -> api["example.com"]["v1"]["/posts"]
 * ```
 *
 * @param {InitConfig} config - Configuration containing the directory path.
 * @returns {Promise<Api>} A promise resolving to a nested API object.
 */
export const initApi = async config => {
  const { dir } = config

  // some servers might have no api.
  if (!dir) {
    return {}
  }

  const startTime = log.hrtime()
  const cwd = process.cwd()

  log.info(`@grundstein/gas: serving api from ${dir}`)

  const files = await fs.getFiles(dir)
  /** @type {Api} */
  const api = {}

  await Promise.all(
    files.map(async file => {
      const relativePath = file.replace(dir, '')
      const [_, host, version, ...pathParts] = relativePath.split(path.sep)

      // initialize this api host and version if it does not exist yet
      api[host] = api[host] || {}
      api[host][version] = api[host][version] || {}

      // get absolute path for import
      const absPath = path.isAbsolute(file) ? file : path.join(cwd, file)

      const { default: lambda } = await import(pathToFileURL(absPath).toString())

      // remove the extension from the lambda path
      const ext = path.extname(file)
      const lambdaPath = pathParts.join('/').replace(ext, '')

      api[host][version][`/${lambdaPath}`] = lambda
    }),
  )

  log.timeTaken(startTime, '@grundstein/gas init took')

  return api
}

export default initApi
