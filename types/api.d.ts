export function initApi(config: InitConfig): Promise<Api>
export default initApi
export type Request = import('http').IncomingMessage
export type Response = import('http').ServerResponse
/**
 * Represents a single API function (“lambda”) that handles a request.
 */
export type LambdaFn = (req: Request, res: Response) => Promise<any> | any
/**
 * A versioned API map, e.g. `{ "v1": { "/users": fn, "/posts": fn } }`
 */
export type VersionedApi = Record<string, Record<string, LambdaFn>>
/**
 * The top-level API map structure, e.g.
 * `{ "example.com": { "v1": { "/foo": fn } } }`
 */
export type Api = Record<string, VersionedApi>
/**
 * Configuration for initializing the API.
 */
export type InitConfig = {
  dir?: string
}
