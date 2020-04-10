import URL from 'url'

import log from '@magic/log'
import is from '@magic/types'

import { lib, middleware } from '@grundstein/commons'

const { formatLog, getRandomId, respond } = lib

export const handler = api => async (req, res) => {
  req = await lib.enhanceRequest(req)

  const startTime = log.hrtime()

  const parsedUrl = URL.parse(req.url)

  if (api) {
    const [requestVersion, fn] = parsedUrl.pathname.split('/').filter(a => a)

    const versionKeys = Object.keys(api)

    if (!versionKeys.includes(requestVersion)) {
      const code = 404
      const body = `Api request urls must start with a version. supported: ${versionKeys.join(' ')}`

      respond(res, { body, code })

      formatLog(req, res, startTime, 'api')
      return
    }

    const version = api[requestVersion]
    const lambda = version[`/${fn}`]

    if (!is.fn(lambda)) {
      const apiKeys = Object.keys(version)

      const code = 404
      const body = `function not found. Got: ${fn}. Supported: ${apiKeys.join(' ')}`

      respond(res, { body, code })

      formatLog(req, res, startTime, 'api')
      return
    }

    if (req.method === 'POST') {
      // this middleware expects small chunks of data.
      // it loads the full request body into ram before returning.
      req.body = await middleware.body(req)

      if (is.error(req.body)) {
        log.error('E_REQ_BODY_PARSE', req.body)
        req.body = ''
      }
    }

    respond(res, await lambda(req, res))

    formatLog(req, res, startTime, 'api')
    return
  }

  respond(res, { body: '404 - not found.', code: 404 })

  formatLog(req, res, startTime, 404)
}

export default handler
