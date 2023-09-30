import { is } from '@grundstein/commons'

import { getSearchFromParams } from './getSearchFromParams.js'

export const filterDbItems = (items, url, searchKeys) => {
  const search = getSearchFromParams(url, searchKeys)

  const results = items.filter(
    item =>
      !search.some(([key, params, options]) => {
        /*
         * if there are no params, we do not filter at all.
         */
        if (!params || !params.length) {
          return false
        }

        const val = item[key]

        /*
         * we have an array,
         * lets loop through the items until one or none matches
         * then return
         */
        if (is.array(val)) {
          return val.some(i => params.includes(i.toLowerCase()))
        }

        if (options?.boolean) {
          console.log('is boolean', params[0], val)

          if (params[0] === 'true') {
            return val !== true
          } else if (params[0] === 'false') {
            console.log('val should be false', val)
            return val !== false
          } else {
            return val
          }
        }

        /*
         * a fuzzy search does a substring compare
         */
        if (options?.fuzzy) {
          return params.filter(param => param.includes(val) || val.includes(param)).length > 0
        }

        /*
         * does our param include our key value?
         */
        return !params.includes(val)
      }),
  )

  return results
}
