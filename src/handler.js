import http2 from 'node:http2'
import { URL } from 'node:url'

import { log, is, middleware, lib } from '@grundstein/commons'

const { body: bodyMiddleware } = middleware

const {
  // HTTP2_HEADER_AUTHORITY,
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN,
  HTTP2_HEADER_ACCESS_CONTROL_ALLOW_HEADERS,
} = http2.constants

/**
 * @typedef {Object} SchemaField
 * @property {string} type - Field type
 * @property {boolean} [multiple] - Whether field can have multiple values
 * @property {string} [itemType] - Type of items in array
 */

/**
 * @typedef {Record<string, SchemaField>} Schema
 */

/**
 * @typedef {Object} ApiVersion
 * @property {Record<string, any>} [db] - Database instance
 * @property {Schema} [schema] - Database schema
 */

/**
 * @typedef {Record<string, Record<string, ApiVersion & Record<string, Function>>>} Api
 */

/**
 * @typedef {Object} LambdaContext
 * @property {Api} api - API configuration
 * @property {Record<string, any>} [db] - Database instance
 * @property {Schema} [schema] - Database schema
 * @property {string | Object} [body] - Request body
 * @property {http2.IncomingHttpHeaders} headers - Request headers
 * @property {http2.ServerHttp2Stream} stream - HTTP/2 stream
 * @property {string} hostname - Request hostname
 * @property {string} version - API version
 * @property {URL} url - Parsed URL
 */

/**
 * @typedef {Object} LambdaResponse
 * @property {number} [code] - HTTP status code
 * @property {string} body - Response body
 * @property {boolean} [json] - Whether response is JSON
 * @property {Record<string, string>} [head] - Response headers
 */

/**
 * @typedef {Object} Response
 * @property {string} body - Response body
 * @property {number} [code] - HTTP status code
 * @property {string} type - Response type
 * @property {[number, number]} [time] - Start time from hrtime
 * @property {Record<string, string | number>} [head] - Response headers
 * @property {boolean} [json] - Whether response is JSON
 */

/**
 * @typedef {Object} EnhancedHttp2Stream
 * @property {http2.ServerHttp2Stream} stream - Original HTTP/2 stream
 */

/**
 * Creates an HTTP/2 request handler
 * @param {Object} options
 * @param {Api} [options.api] - API configuration object
 * @param {import('./api.js').Config} [options.config] - Server configuration
 * @returns {(stream: http2.ServerHttp2Stream, headers: http2.IncomingHttpHeaders) => Promise<void>}
 */
export const handler =
  ({ api, config }) =>
  async (stream, headers) => {
    const { corsOrigin, corsHeaders } = config || {}

    stream = lib.enhanceRequest(stream)

    const startTime = log.hrtime()

    const headerPath = headers[HTTP2_HEADER_PATH]

    /*
     * TODO: only allow certain authority fields.
     * use /home/grundstein/environment as the config file
     */

    // const authority = headers[HTTP2_HEADER_AUTHORITY]
    // if (!authority) {
    //   const [host, port] = authority.split(':')
    // }

    const hostname = lib.getHostname(headers)
    const parsedUrl = new URL('https://' + hostname + headerPath)

    if (api) {
      const [requestVersion, ...fn] = parsedUrl.pathname.split('/').filter(a => a)

      if (!api || is.empty(api) || !api.hasOwnProperty(hostname)) {
        /** @type {Response} */
        const response = {
          body: `No api for this host available.`,
          type: 'api',
          time: startTime,
        }

        lib.respond(stream, headers, response)

        return
      }

      const versionKeys = Object.keys(api[hostname])

      if (!versionKeys.includes(requestVersion)) {
        /** @type {Response} */
        const response = {
          head: {
            [HTTP2_HEADER_STATUS]: 404,
          },
          body: `Api request urls must start with a version. supported: ${versionKeys.join(' ')}`,
          type: 'api',
          time: startTime,
        }

        lib.respond(stream, headers, response)
        return
      }

      const version = api[hostname][requestVersion]
      const fullPath = `/${fn.join('/')}`
      const lambda = version[fullPath]
      const { db, schema } = version

      if (!is.fn(lambda)) {
        const apiKeys = Object.keys(version).filter(k => k.startsWith('/') && !k.startsWith('/_'))

        /** @type {Response} */
        const response = {
          body: `Function not found. Got: ${fn}. Supported: ${apiKeys.join(' ')}`,
          type: 'api',
          time: startTime,
        }

        lib.respond(stream, headers, response)
        return
      }

      /** @type {string | Object | undefined} */
      let body

      if (headers[HTTP2_HEADER_METHOD] === 'POST') {
        body = await bodyMiddleware(stream, headers)

        if (is.error(body)) {
          log.error('E_REQ_BODY_PARSE', body)
          body = ''
        }
      }

      /** @type {Record<string, string>} */
      const defaultHead = {}

      if (corsOrigin) {
        let val = '*'

        if (corsOrigin !== '*') {
          const forwardedFor = is.arr(headers['x-forwarded-for'])
            ? headers['x-forwarded-for'][0]
            : headers['x-forwarded-for']
          if (forwardedFor && corsOrigin.includes(forwardedFor)) {
            val = forwardedFor
          }
        }

        defaultHead[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN] = val
        if (corsHeaders) {
          defaultHead[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_HEADERS] = corsHeaders
        }
      }

      /* actually execute the api function */
      const result = await lambda({
        api,
        db,
        schema,
        body,
        headers,
        stream,
        hostname,
        version: requestVersion,
        url: parsedUrl,
      })

      const head = {
        ...defaultHead,
        ...result.head,
      }

      /* todo: find out other keys in result and explicitly load them here */
      const { code } = result

      /** @type {Response} */
      const response = {
        ...result,
        code,
        time: startTime,
        head,
        type: 'api',
      }

      lib.respond(stream, headers, response)
      return
    }

    lib.respond(stream, headers, { body: '404 - not found.', code: 404, type: 'api' })
  }

export default handler
