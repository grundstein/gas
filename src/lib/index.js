import { filterDbItems } from './filterDbItems.js'
import { getSearchFromParams } from './getSearchFromParams.js'

export const query = {
  filter: filterDbItems,
  getSearchFromParams,
}

export default query
