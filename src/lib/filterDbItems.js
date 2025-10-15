import { getSearchFromParams } from './getSearchFromParams.js'
import { filterSingleItem } from './filterSingleItem.js'

/**
 * @typedef {string | { key: string, fuzzy?: boolean, boolean?: boolean }} SearchKey
 */

/**
 * Filter database items based on URL search parameters
 * @param {any[]} items - Array of items to filter
 * @param {URL} url - URL object with search parameters
 * @param {SearchKey[]} searchKeys - Array of search keys to filter by
 * @returns {any[]} Filtered array of items
 */
export const filterDbItems = (items, url, searchKeys) => {
  const params = getSearchFromParams(url.searchParams, searchKeys)

  const results = items.filter(item => !params.some(param => filterSingleItem(param, item)))

  return results
}
