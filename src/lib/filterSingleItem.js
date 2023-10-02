import { is } from '@grundstein/commons'

import { anyToLowerCase } from './anyToLowerCase.js'

export const searchSingleItem = (item, [key, params, options]) => {
  /*
   * if there are no params, we do not filter at all.
   */
  if (!params || !params.length) {
    return false
  }

  const val = anyToLowerCase(item[key])
  params = anyToLowerCase(params)

  /*
   * we have an array,
   * lets loop through the items until one or none matches
   * then return
   */
  if (is.array(val)) {
    return val.some(i => params.includes(i))
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
    const filteredParams = params.filter(param => param.includes(val) || val.includes(param))
    return filteredParams.length > 0
  }

  /*
   * does our param include our key value?
   */
  return !params.includes(val)
}
