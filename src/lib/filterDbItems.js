import { getSearchFromParams } from './getSearchFromParams.js'
import { filterSingleItem } from './filterSingleItem.js'

export const filterDbItems = (items, url, searchKeys) => {
  const params = getSearchFromParams(url, searchKeys)

  const results = items.filter(item => !params.some(param => filterSingleItem(param, item)))

  return results
}
