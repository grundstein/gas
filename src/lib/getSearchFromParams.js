import { is } from '@grundstein/commons'

export const getSearchFromParams = (searchParams, searchKeys) => {
  if (!searchParams) {
    return []
  }

  /** @type [string, string[], object][] */
  const search = []

  searchKeys.forEach(searchKey => {
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
      const searchItem = [searchKey, filteredParams]
      if (options) {
        searchItem.push(options)
      }

      search.push(searchItem)
    }
  })

  return search
}
