export function run(config?: Partial<Config>): Promise<void>
export default run
export type Config = {
  dir?: string | undefined
  startTime: [number, number]
}
