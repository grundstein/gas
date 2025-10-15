import { is } from '@magic/test'

import { getSearchFromParams } from '../../src/lib/getSearchFromParams.js'

export default [
  {
    fn: getSearchFromParams(),
    expect: is.deep.equal([]),
    info: 'getSearchFromParams without args returns empty array',
  },
]
