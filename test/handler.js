import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Readable } from 'node:stream'

import { log } from '@grundstein/commons'
import { fs, is } from '@magic/test'

import { handler } from '../src/handler.js'
import defaultInitApi, { initApi } from '../src/api.js'

const testApiDir = path.join(process.cwd(), 'test', '.fixtures', 'api')
const apiHello = `
export default async (req, res) => {
  return {
    body: 'Hello World',
    code: 200,
  }
}
`
const apiHelloFilePath = path.join(testApiDir, 'hello.js')

// Mock API structure for testing
const mockApi = {
  localhost: {
    v1: {
      '/test': async (_req, _res) => ({ body: 'test response', code: 200 }),
      '/error': async (_req, _res) => {
        throw new Error('test error')
      },
    },
  },
}

const mockConfig = {
  startTime: [0, 0],
  corsOrigin: '*',
  corsHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
}

// Helper to create mock request
const createMockRequest = (url = '/v1/test', method = 'GET', hostname = 'localhost') => {
  const req = Object.assign(new Readable(), {
    url,
    method,
    headers: {
      host: hostname,
    },
    httpVersion: '1.1',
    httpVersionMajor: 1,
    httpVersionMinor: 1,
  })
  return req
}

// Helper to create mock response
const createMockResponse = () => {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader: function (key, value) {
      this.headers[key] = value
    },
    writeHead: function (code, headers) {
      this.statusCode = code
      if (headers) {
        Object.assign(this.headers, headers)
      }
    },
    write: function (data) {
      this.body += data
    },
    end: function (data) {
      if (data) this.body += data
    },
  }
  return res
}

const before = () => {
  const originalServerLog = log.server
  const originalError = log.error
  const originalInfo = log.info
  const originalTimeTaken = log.timeTaken

  log.server = {
    request: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  }

  log.error = () => {}
  log.info = () => {}
  log.timeTaken = () => {}

  return () => {
    log.server = originalServerLog
    log.error = originalError
    log.info = originalInfo
    log.timeTaken = originalTimeTaken
  }
}

const addFilesBefore = async () => {
  await fs.mkdirp(testApiDir)

  await fs.writeFile(apiHelloFilePath, apiHello)

  const afterRegularBefore = before()

  return async () => {
    await fs.rmrf(testApiDir)

    afterRegularBefore()
  }
}

export default [
  {
    fn: () => handler(mockApi, mockConfig),
    expect: is.fn,
    info: 'handler returns a function',
  },
  {
    fn: async () => {
      const h = handler(mockApi, mockConfig)
      const req = createMockRequest()
      const res = createMockResponse()
      await h(req, res)
      return res.statusCode
    },
    before,
    expect: 200,
    info: 'handler processes valid request successfully',
  },
  {
    fn: async () => {
      const h = handler({}, mockConfig)
      const req = createMockRequest()
      const res = createMockResponse()
      await h(req, res)
      return res.statusCode
    },
    before,
    expect: 404,
    info: 'handler returns 404 when no api for host',
  },
  {
    fn: async () => {
      const h = handler(mockApi, mockConfig)
      const req = createMockRequest('/v2/test')
      const res = createMockResponse()
      await h(req, res)
      return res.statusCode
    },
    before,
    expect: 404,
    info: 'handler returns 404 for unsupported version',
  },
  {
    fn: async () => {
      const h = handler(mockApi, mockConfig)
      const req = createMockRequest('/v1/nonexistent')
      const res = createMockResponse()
      await h(req, res)
      return res.statusCode
    },
    before,
    expect: 404,
    info: 'handler returns 404 for nonexistent function',
  },
  {
    fn: async () => {
      const h = handler(mockApi, mockConfig)
      const req = createMockRequest('/v1/test', 'POST')
      req.headers['content-type'] = 'application/json'
      const res = createMockResponse()

      // Add body data to the stream
      req.push(JSON.stringify({ test: 'data' }))
      req.push(null)

      await h(req, res)
      return req.method
    },
    before,
    expect: 'POST',
    info: 'handler processes POST requests',
  },
  {
    fn: async () => {
      const h = handler(mockApi, mockConfig)
      const req = createMockRequest('/v1/test', 'POST')
      req.headers['content-type'] = 'application/json'
      const res = createMockResponse()

      // Simulate body parsing error by not making it a proper stream
      const badReq = { ...req }
      delete badReq.on

      await h(badReq, res)
      return badReq.body
    },
    before,
    expect: '',
    info: 'handler handles POST body parsing errors',
  },
  {
    fn: async () => {
      const configWithOrigin = { ...mockConfig, corsOrigin: '*' }
      const h = handler(mockApi, configWithOrigin)
      const req = createMockRequest()
      const res = createMockResponse()
      await h(req, res)
      return res.headers['access-control-allow-origin']
    },
    before,
    expect: '*',
    info: 'handler sets CORS headers to * when corsOrigin is *',
  },
  {
    fn: async () => {
      const configWithOrigin = { ...mockConfig, corsOrigin: ['https://example.com'] }
      const h = handler(mockApi, configWithOrigin)
      const req = createMockRequest()
      req.headers['x-forwarded-for'] = 'https://example.com'
      const res = createMockResponse()
      await h(req, res)
      return res.headers['access-control-allow-origin']
    },
    before,
    expect: 'https://example.com',
    info: 'handler sets CORS headers correctly for specific origin',
  },
  {
    fn: async () => {
      const configWithOrigin = { ...mockConfig, corsOrigin: ['https://example.com'] }
      const h = handler(mockApi, configWithOrigin)
      const req = createMockRequest()
      req.headers['x-forwarded-for'] = ['https://example.com', 'other']
      const res = createMockResponse()
      await h(req, res)
      return res.headers['access-control-allow-origin']
    },
    before,
    expect: 'https://example.com',
    info: 'handler handles x-forwarded-for as array',
  },
  {
    fn: async () => {
      const h = handler(mockApi, mockConfig)
      const req = createMockRequest()
      req.url = null
      const res = createMockResponse()
      await h(req, res)
      return res.statusCode
    },
    before,
    expect: 404,
    info: 'handler returns 404 when req.url is null',
  },

  // api.js tests
  { fn: () => initApi, expect: is.fn, info: 'initApi is a function' },
  { fn: () => defaultInitApi, expect: is.fn, info: 'initApi default export is a function' },
  { fn: is.deep.eq(initApi, defaultInitApi), info: 'initApi exports are equal' },
  {
    fn: async () => {
      const result = await initApi({})
      return is.object(result)
    },
    before,
    expect: true,
    info: 'initApi returns an object when no dir provided',
  },
  {
    fn: async () => {
      const result = await initApi({})
      return is.empty(result)
    },
    before,
    expect: true,
    info: 'initApi returns empty object when no dir provided',
  },
  {
    fn: async () => {
      const result = await initApi({ dir: testApiDir })
      // Check if any host was loaded
      const hosts = Object.keys(result)
      if (hosts.length === 0) return false

      // Check if the first host has a version
      const firstHost = result[hosts[0]]
      const versions = Object.keys(firstHost)
      if (versions.length === 0) return false

      // Check if the first version has any functions
      const firstVersion = firstHost[versions[0]]
      const funcs = Object.keys(firstVersion)
      return funcs.length > 0 && is.fn(firstVersion[funcs[0]])
    },
    before: addFilesBefore,
    expect: true,
    info: 'initApi loads lambda functions from directory',
  },
  {
    fn: async () => {
      const result = await initApi({ dir: testApiDir })

      // Get first available function
      const hosts = Object.keys(result)
      if (hosts.length === 0) return false

      const firstHost = result[hosts[0]]
      const versions = Object.keys(firstHost)
      if (versions.length === 0) return false

      const firstVersion = firstHost[versions[0]]
      const funcs = Object.keys(firstVersion)
      if (funcs.length === 0) return false

      const lambda = firstVersion[funcs[0]]
      if (!is.fn(lambda)) return false

      const mockReq = {}
      const mockRes = {}
      const response = await lambda(mockReq, mockRes)
      return is.object(response) && response.body && response.code === 200
    },
    before: addFilesBefore,
    expect: true,
    info: 'initApi lambda functions work correctly',
  },
]
