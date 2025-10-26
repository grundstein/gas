export function handler(
  api: Api,
  config: Config,
): (
  req: IncomingMessage & {
    body?: string | Object
  },
  res: ServerResponse,
) => Promise<void>
export default handler
export type IncomingMessage = import('http').IncomingMessage
export type ServerResponse = import('http').ServerResponse
export type Request = import('http').IncomingMessage & {
  url: string
  method: string
  headers: Record<string, string | string[] | undefined>
  body?: any
}
export type Response = import('http').ServerResponse & {
  json?: (body: any) => void
}
export type Api = {
  [hostname: string]: {
    [version: string]: {
      [path: string]: (req: IncomingMessage, res: ServerResponse) => Promise<any> | any
    }
  }
}
export type Config = {
  corsOrigin?: string | string[]
  corsHeaders?: string
  startTime: [number, number]
}
