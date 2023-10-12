import { is, lib } from '@grundstein/commons'

export const filterSingleItem = (searchParams, item) => {
  let [key, params, options] = searchParams

  /*
   * if there are no params, we do not filter at all.
   */
  if (!params || !params.length) {
    return false
  }

  params = lib.anyToLowerCase(params)

  const val = lib.anyToLowerCase(item[key])

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

  if (options?.boolean) {
    if (params[0] === 'true') {
      return val !== true
    } else if (params[0] === 'false') {
      return val !== false
    } else {
      return val
    }
  }

  /*
   * a fuzzy search does a substring compare
   */
  if (options?.fuzzy) {
    const filteredParams = params.filter(param => val.includes(param))
    return filteredParams.length <= 0
  }

  /*
   * does our param include our key value?
   */
  return !params.includes(val)
}
