export function handler({
  api,
  config,
}: {
  api?: Api | undefined
  config?: import('./api.js').Config | undefined
}): (stream: http2.ServerHttp2Stream, headers: http2.IncomingHttpHeaders) => Promise<void>
export default handler
export type SchemaField = {
  /**
   * - Field type
   */
  type: string
  /**
   * - Whether field can have multiple values
   */
  multiple?: boolean | undefined
  /**
   * - Type of items in array
   */
  itemType?: string | undefined
}
export type Schema = Record<string, SchemaField>
export type ApiVersion = {
  /**
   * - Database instance
   */
  db?: Record<string, any> | undefined
  /**
   * - Database schema
   */
  schema?: Schema | undefined
}
export type Api = Record<string, Record<string, ApiVersion & Record<string, Function>>>
export type LambdaContext = {
  /**
   * - API configuration
   */
  api: Api
  /**
   * - Database instance
   */
  db?: Record<string, any> | undefined
  /**
   * - Database schema
   */
  schema?: Schema | undefined
  /**
   * - Request body
   */
  body?: string | Object | undefined
  /**
   * - Request headers
   */
  headers: http2.IncomingHttpHeaders
  /**
   * - HTTP/2 stream
   */
  stream: http2.ServerHttp2Stream
  /**
   * - Request hostname
   */
  hostname: string
  /**
   * - API version
   */
  version: string
  /**
   * - Parsed URL
   */
  url: URL
}
export type LambdaResponse = {
  /**
   * - HTTP status code
   */
  code?: number | undefined
  /**
   * - Response body
   */
  body: string
  /**
   * - Whether response is JSON
   */
  json?: boolean | undefined
  /**
   * - Response headers
   */
  head?: Record<string, string> | undefined
}
export type Response = {
  /**
   * - Response body
   */
  body: string
  /**
   * - HTTP status code
   */
  code?: number | undefined
  /**
   * - Response type
   */
  type: string
  /**
   * - Start time from hrtime
   */
  time?: [number, number] | undefined
  /**
   * - Response headers
   */
  head?: Record<string, string | number> | undefined
  /**
   * - Whether response is JSON
   */
  json?: boolean | undefined
}
export type EnhancedHttp2Stream = {
  /**
   * - Original HTTP/2 stream
   */
  stream: http2.ServerHttp2Stream
}
import http2 from 'node:http2'
import { URL } from 'node:url'
