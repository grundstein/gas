import { is } from '@grundstein/commons'

export const getSearchFromParams = (url, searchKeys) => {
  if (!url) {
    return []
  }

  /** @type [string, string[], object][] */
  const search = []

  searchKeys.forEach(key => {
    let options

    if (is.objectNative(key)) {
      const { key: k, ...o } = key
      options = o
      key = k.toLowerCase()
    }

    const params = url.searchParams
      .getAll(key)
      .filter(a => a)
      .map(a => a.toLowerCase())

    if (params.length) {
      search.push([key, params, options])
    }
  })

  return search
}
