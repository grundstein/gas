import { is } from '@grundstein/commons'

export const getSearchFromParams = (url, searchKeys) => {
  if (!url) {
    return []
  }

  /** @type [string, string[], object][] */
  const search = []

  searchKeys.forEach(searchKey => {
    let options

    /*
     * allow
     */
    if (is.objectNative(searchKey)) {
      const { key: k, ...o } = searchKey
      options = o
      searchKey = k.toLowerCase()
    }

    const params = url.searchParams.getAll(searchKey)

    const filteredParams = params.filter(a => a).map(a => a.toLowerCase())

    if (filteredParams.length) {
      search.push([searchKey, filteredParams, options])
    }
  })

  return search
}
