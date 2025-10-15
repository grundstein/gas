export function initApi(config: Config): Promise<Api>
export default initApi
export type Config = {
  /**
   * - API directory path
   */
  dir?: string | undefined
  /**
   * - Name of the data file (e.g., 'getData.js')
   */
  dataFile: string
  startTime?: [number, number] | undefined
  corsOrigin?: string | undefined
  corsHeaders?: string | undefined
}
export type SchemaFieldString = {
  /**
   * - Field type
   */
  type: 'string' | 'slug'
  /**
   * - Whether field can have multiple values
   */
  multiple?: boolean | undefined
}
export type SchemaFieldArray = {
  /**
   * - Field type
   */
  type: 'array'
  /**
   * - Type of items in array
   */
  itemType: string
}
export type SchemaFieldBoolean = {
  /**
   * - Field type
   */
  type: 'boolean'
}
export type SchemaField = SchemaFieldString | SchemaFieldArray | SchemaFieldBoolean
export type Schema = Record<string, SchemaField>
export type GetDataResult = {
  /**
   * - Database object
   */
  db: Record<string, any>
  /**
   * - Database schema
   */
  schema?: Schema | undefined
}
export type ApiVersionBase = {
  /**
   * - Database instance
   */
  db?: Record<string, any> | undefined
  /**
   * - Database schema
   */
  schema?: Schema | undefined
}
export type ApiVersion = ApiVersionBase & Record<string, Function>
export type Api = Record<string, Record<string, ApiVersion>>
export type LambdaContext = {
  /**
   * - Parsed URL object
   */
  url: URL
  /**
   * - Request body
   */
  body?: string | Object | undefined
  /**
   * - Request headers
   */
  headers?: Object | undefined
}
export type LambdaResponse = {
  /**
   * - HTTP status code
   */
  code: number
  /**
   * - Response body
   */
  body: string
  /**
   * - Whether response is JSON
   */
  json?: boolean | undefined
}
export type CreateApiFromSchemaParams = {
  /**
   * - API object to modify
   */
  api: Api
  /**
   * - API version
   */
  version: string
  /**
   * - Hostname
   */
  host: string
  /**
   * - Database object
   */
  db: Record<string, any>
  /**
   * - Database schema
   */
  schema: Schema
}
export type SearchKey =
  | string
  | {
      key: string
      fuzzy?: boolean
      boolean?: boolean
    }
