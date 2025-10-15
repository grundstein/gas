export function filterSingleItem(
  searchParams: [string, string[] | string, SearchOptions?],
  item: Record<string, string | string[]>,
): boolean
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
