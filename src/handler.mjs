import URL from 'url'

import is from '@magic/types'

import { log } from '@grundstein/commons'
import lib from '@grundstein/commons/lib.mjs'
import middleware from '@grundstein/commons/middleware.mjs'

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

      lib.respond(req, res, { body, code, type: 'api' })
      return
    }

    const version = api[requestVersion]
    const lambda = version[`/${fn}`]

    if (!is.fn(lambda)) {
      const apiKeys = Object.keys(version)

      const code = 404
      const body = `Function not found. Got: ${fn}. Supported: ${apiKeys.join(' ')}`

      lib.respond(req, res, { body, code, time: startTime, type: 'api' })
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

    const body = await lambda(req, res)
    lib.respond(req, res, { body, code: 200, time: startTime, type: 'api' })
    return
  }

  lib.respond(res, { body: '404 - not found.', code: 404, type: 'api' })
}

export default handler
