import { URL } from 'node:url'

import { is } from '@magic/test'

import { getSearchFromParams } from '../../src/lib/getSearchFromParams.js'

export default [
  {
    fn: getSearchFromParams(),
    expect: is.deep.equal([]),
    info: 'getSearchFromParams without args returns empty array',
  },
  {
    fn: getSearchFromParams(new URL('https://localhost:2351/v1/?slug=testname').searchParams, [
      { key: 'slug', fuzzy: true },
    ]),
    expect: is.deep.equal(['slug', ['testname'], { fuzzy: true }]),
    info: 'getSearchFromParams works for slug and fuzzy',
  },
]
