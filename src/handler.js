import http2 from 'node:http2'
import { URL } from 'node:url'

import { log, is, lib } from '@grundstein/commons'
import { body as bodyMiddleware } from '@grundstein/commons/middleware.js'

const {
  // HTTP2_HEADER_AUTHORITY,
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN,
  HTTP2_HEADER_ACCESS_CONTROL_ALLOW_HEADERS,
} = http2.constants

export const handler =
  ({ api, config = {} }) =>
  async (stream, headers) => {
    const { corsOrigin, corsHeaders } = config

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

      if (!api || is.empty(api)) {
        const response = {
          head: {
            [HTTP2_HEADER_STATUS]: 404,
          },
          body: `No api for this host available.`,
          type: 'api',
          time: startTime,
        }

        lib.respond(stream, headers, response)

        return
      }

      const versionKeys = Object.keys(api)

      if (!versionKeys.includes(requestVersion)) {
        const response = {
          headers: {
            [HTTP2_HEADER_STATUS]: 404,
          },
          body: `Api request urls must start with a version. supported: ${versionKeys.join(' ')}`,
          type: 'api',
          time: startTime,
        }

        lib.respond(stream, headers, response)
        return
      }

      const version = api[requestVersion]
      const fullPath = `/${fn.join('/')}`
      const lambda = version[fullPath]
      const { db, schema } = version

      if (!is.fn(lambda)) {
        const apiKeys = Object.keys(version).filter(k => k.startsWith('/') && !k.startsWith('/_'))

        const response = {
          head: {
            [HTTP2_HEADER_STATUS]: 404,
          },
          body: `Function not found. Got: ${fn}. Supported: ${apiKeys.join(' ')}`,
          type: 'api',
          time: startTime,
        }

        lib.respond(stream, headers, response)
        return
      }

      let body

      if (headers[HTTP2_HEADER_METHOD] === 'POST') {
        body = await bodyMiddleware(stream, headers)

        if (is.error(body)) {
          log.error('E_REQ_BODY_PARSE', body)
          body = ''
        }
      }

      const defaultHead = {}

      if (corsOrigin) {
        let val = '*'

        if (corsOrigin !== '*') {
          const forwardedFor = headers['x-forwarded-for']
          if (forwardedFor && corsOrigin.includes(forwardedFor)) {
            val = forwardedFor
          }
        }

        defaultHead[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN] = val
        defaultHead[HTTP2_HEADER_ACCESS_CONTROL_ALLOW_HEADERS] = corsHeaders
      }

      /* actually execute the api function */
      const result = await lambda({ api, db, schema, body, headers, stream, url: parsedUrl })

      const head = {
        ...defaultHead,
        ...result.head,
      }

      /* todo: find out other keys in result and explicitly load them here */
      const { code } = result

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
