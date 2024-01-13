import { URL } from 'node:url'

import { is } from '@magic/test'

import { filterDbItems } from '../../src/lib/filterDbItems.js'

const exampleData = [
  { slug: 'item1', name: 'item 1', bool: true },
  { slug: 'item2', name: 'item 2', bool: false },
  { slug: 'item3', name: 'item 3', bool: true },
]

const path = 'https://localhost:2351/v1/table/'

const searchKeys = ['slug', 'name', 'bool']

export default [
  {
    fn: () => {
      const url = new URL(`${path}`)
      return filterDbItems(exampleData, url, searchKeys)
    },
    expect: is.deep.equal(exampleData),
    info: 'simple query returning all items',
  },
  {
    fn: () => {
      const url = new URL(`${path}?slug=item1`)
      return filterDbItems(exampleData, url, searchKeys)
    },
    expect: is.deep.equal([exampleData[0]]),
    info: 'query for one item by slug',
  },
  {
    fn: () => {
      const url = new URL(`${path}?bool=true`)
      return filterDbItems(exampleData, url, searchKeys)
    },
    expect: is.deep.equal([exampleData[0], exampleData[2]]),
    info: 'query for items by bool value',
  },
]
