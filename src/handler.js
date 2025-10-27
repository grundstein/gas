import {
  log,
  is,
  enhanceRequest,
  getHostname,
  respond,
  body as bodyMiddleware,
} from '@grundstein/commons'

import httpConstants from '@magic/http1-constants'

const { ACCESS_CONTROL_ALLOW_ORIGIN, ACCESS_CONTROL_ALLOW_HEADERS, X_FORWARDED_FOR } =
  httpConstants.headers

/**
 * @typedef {import('http').IncomingMessage} IncomingMessage
 * @typedef {import('http').ServerResponse} ServerResponse
 */

/**
 * @typedef {import('http').IncomingMessage & {
 *   url: string;
 *   method: string;
 *   headers: Record<string, string | string[] | undefined>;
 *   body?: any;
 * }} Request
 */

/**
 * @typedef {import('http').ServerResponse & {
 *   json?: (body: any) => void;
 * }} Response
 */

/**
 * @typedef {{
 *   [hostname: string]: {
 *     [version: string]: {
 *       [path: string]: (req: IncomingMessage, res: ServerResponse) => Promise<any> | any
 *     }
 *   }
 * }} Api
 */

/**
 * @typedef {{
 *   corsOrigin?: string | string[];
 *   corsHeaders?: string;
 *   startTime: [number, number]
 * }} Config
 */

/**
 * Creates an HTTP handler that dispatches API requests based on hostname and version.
 *
 * @param {Api} api - An object containing APIs organized by hostname and version.
 * @param {Config} config - Configuration for CORS and headers.
 * @returns {(req: IncomingMessage & { body?: string | Object}, res: ServerResponse) => Promise<void>}
 */
export const handler = (api, config) => async (req, res) => {
  const { corsOrigin, corsHeaders } = config

  req = enhanceRequest(req)
  const startTime = log.hrtime()

  const hostname = getHostname(req)

  /** @type {Record<string, string>} */
  const headers = {}

  if (corsOrigin) {
    let val = '*'
    if (corsOrigin !== '*') {
      const forwardedHeader = req.headers[X_FORWARDED_FOR]
      const forwardedFor = is.array(forwardedHeader) ? forwardedHeader[0] : forwardedHeader

      if (forwardedFor && corsOrigin.includes(forwardedFor)) {
        val = forwardedFor
      }
    }

    headers[ACCESS_CONTROL_ALLOW_ORIGIN] = val
    if (corsHeaders) {
      headers[ACCESS_CONTROL_ALLOW_HEADERS] = corsHeaders
    }
  }

  if (api && req.url) {
    const [requestVersion, fn] = req.url.split('/').filter(a => a)

    const hostApi = api[hostname]

    if (!hostApi || is.empty(hostApi)) {
      const code = 404
      const body = `No api for this host available.`

      respond(req, res, { body, code, headers, type: 'api' })
      return
    }

    const versionKeys = Object.keys(hostApi)

    if (!versionKeys.includes(requestVersion)) {
      const code = 404
      const body = `Api request urls must start with a version. supported: ${versionKeys.join(' ')}`

      respond(req, res, { body, code, headers, type: 'api' })
      return
    }

    const version = hostApi[requestVersion]
    const lambda = version[`/${fn}`]

    if (!is.fn(lambda)) {
      const apiKeys = Object.keys(version)

      const code = 404
      const body = `Function not found. Got: ${fn}. Supported: ${apiKeys.join(' ')}`

      respond(req, res, { body, code, headers, time: startTime, type: 'api' })
      return
    }

    if (req.method === 'POST') {
      try {
        req.body = await bodyMiddleware(req)
      } catch (e) {
        log.error('E_REQ_BODY_PARSE', e)
        req.body = ''
      }
    }

    const response = await lambda(req, res)

    Object.assign(headers, response.headers)

    respond(req, res, { ...response, time: startTime, headers, type: 'api' })
    return
  }

  respond(req, res, { body: '404 - not found.', code: 404, headers, type: 'api' })
}

export default handler
