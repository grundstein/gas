import { getSearchFromParams } from './getSearchFromParams.js'
import { filterSingleItem } from './filterSingleItem.js'

export const filterDbItems = (items, url, searchKeys) => {
  const search = getSearchFromParams(url, searchKeys)

  const results = items.filter(item => search.some(s => {
    const [key, params, options] = s
    const val = item[key]

    return filterSingleItem(val, params, options)
  }))

  return results
}
