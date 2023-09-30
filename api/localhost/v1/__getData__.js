import * as db from '../../../../../arm/ar/db/index.js'
import { schema } from '../../../../../arm/ar/db/schema.js'

export const getData = async () => {
  return {
    db: {
      table: [
        {
          slug: 'item1',
          name: 'item 1',
          key1: 'item 1 key1',
          key2: 'item 1 key2',
        },
        {
          slug: 'item2',
          name: 'item 2',
          key1: 'item 2 key1',
          key2: 'item 2 key2',
        },
        {
          slug: 'item3',
          name: 'item 3',
          key1: 'item 3 key1',
          key2: 'item 3 key2',
        },
      ],
    },
    schema: {
      table: {
        slug: { type: 'slug' },
        name: { type: 'string', multiple: true },
        key1: { type: 'string' },
        key2: { type: 'string' },
      },
    },
  }
}
