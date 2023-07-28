import URL from 'url'

import { log, is } from '@grundstein/commons'
import { enhanceRequest, getHostname, respond } from '@grundstein/commons/lib.mjs'
import { body as bodyMiddleware } from '@grundstein/commons/middleware.mjs'

export const handler = (api, config) => async (req, res) => {
  const { corsOrigin, corsHeaders } = config

  req = enhanceRequest(req)

  const startTime = log.hrtime()

  const parsedUrl = URL.parse(req.url)
  const hostname = getHostname(req)

  if (api) {
    const [requestVersion, fn] = parsedUrl.pathname.split('/').filter(a => a)

    const hostApi = api[hostname]

    if (!hostApi || is.empty(hostApi)) {
      const code = 404
      const body = `No api for this host available.`

      respond(req, res, { body, code, type: 'api' })
      return
    }

    const versionKeys = Object.keys(hostApi)

    if (!versionKeys.includes(requestVersion)) {
      const code = 404
      const body = `Api request urls must start with a version. supported: ${versionKeys.join(' ')}`

      respond(req, res, { body, code, type: 'api' })
      return
    }

    const version = hostApi[requestVersion]
    const lambda = version[`/${fn}`]

    if (!is.fn(lambda)) {
      const apiKeys = Object.keys(version)

      const code = 404
      const body = `Function not found. Got: ${fn}. Supported: ${apiKeys.join(' ')}`

      respond(req, res, { body, code, time: startTime, type: 'api' })
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

    const headers = {}

    if (corsOrigin) {
      let val = '*'
      if (corsOrigin !== '*') {
        const forwardedFor = req.headers['x-forwarded-for']
        if (forwardedFor && corsOrigin.includes(forwardedFor)) {
          val = forwardedFor
        }
      }

      headers['Access-Control-Allow-Origin'] = val
      headers['Access-Control-Allow-Headers'] = corsHeaders
    }

    const body = await lambda(req, res)
    respond(req, res, { ...body, time: startTime, headers, type: 'api' })
    return
  }

  respond(res, { body: '404 - not found.', code: 404, type: 'api' })
}

export default handler
