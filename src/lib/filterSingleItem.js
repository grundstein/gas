import { is, lib } from '@grundstein/commons'

/**
 * @typedef {Object} SearchOptions
 * @property {boolean} [fuzzy] - Whether to perform fuzzy search
 * @property {boolean} [boolean] - Whether this is a boolean field
 */

/**
 * Filter a single item based on search parameters
 * @param {[string, string[] | string, SearchOptions?]} searchParams - Tuple of [key, params, options]
 * @param {Record<string, string | string[]>} item - Item to filter
 * @returns {boolean} True if item should be filtered out, false if it should be kept
 */
export const filterSingleItem = (searchParams, item) => {
  let [key, params, options] = searchParams

  const val = item[key]

  /*
   * if there are no params, we do not filter at all.
   */
  if (!params || !params.length) {
    return false
  }

  params = lib.anyToLowerCase(params)

  /*
   * we have an array,
   * lets loop through the items until one or none matches
   * then return
   */
  if (is.array(val)) {
    const hasMatch = val.some(v => {
      if (is.arr(params)) {
        return params.some(p => v.includes(p))
      } else {
        return v.includes(params)
      }
    })

    return !hasMatch
  }

  if (params[0] === 'true') {
    return `${val}` !== 'true'
  } else if (params[0] === 'false') {
    return `${val}` !== 'false'
  }

  /*
   * a fuzzy search does a substring compare
   */
  if (options?.fuzzy) {
    const filteredParams = is.string(params)
      ? val.includes(params)
      : params.some(param => val.includes(param))
    return !filteredParams
  }

  /*
   * does our param include our key value?
   */
  return !params.includes(val)
}
