export function getSearchFromParams(
  searchParams: URLSearchParams,
  searchKeys: SearchKey[],
): Array<[string, string[], SearchOptions?]>
export type SearchKey =
  | string
  | {
      key: string
      fuzzy?: boolean
      boolean?: boolean
    }
export type SearchOptions = {
  /**
   * - Whether to perform fuzzy search
   */
  fuzzy?: boolean | undefined
  /**
   * - Whether this is a boolean field
   */
  boolean?: boolean | undefined
}
