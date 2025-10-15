import { is } from '@grundstein/commons'

/**
 * @typedef {string | { key: string, fuzzy?: boolean, boolean?: boolean }} SearchKey
 */

/**
 * @typedef {Object} SearchOptions
 * @property {boolean} [fuzzy] - Whether to perform fuzzy search
 * @property {boolean} [boolean] - Whether this is a boolean field
 */

/**
 * Extract search parameters from URL search params based on search keys
 * @param {URLSearchParams} searchParams - URL search parameters
 * @param {SearchKey[]} searchKeys - Array of search keys to extract
 * @returns {Array<[string, string[], SearchOptions?]>} Array of search tuples
 */
export const getSearchFromParams = (searchParams, searchKeys) => {
  if (!searchParams) {
    return []
  }

  /** @type {Array<[string, string[], SearchOptions?]>} */
  const search = []

  searchKeys.forEach(searchKey => {
    /** @type {SearchOptions | undefined} */
    let options

    /*
     * allow searchKeys to be objects,
     * used for fuzzy, might be used for boolean or optional in the future.
     */
    if (is.objectNative(searchKey)) {
      const { key, ...opts } = searchKey
      options = opts
      searchKey = key.toLowerCase()
    }

    const params = searchParams.getAll(searchKey)

    const filteredParams = params.filter(a => a).map(a => a.toLowerCase())

    if (filteredParams.length) {
      /** @type {[string, string[], SearchOptions?]} */
      const searchItem = [searchKey, filteredParams]
      if (options) {
        searchItem.push(options)
      }

      search.push(searchItem)
    }
  })

  return search
}
