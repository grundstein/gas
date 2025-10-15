export function filterDbItems(items: any[], url: URL, searchKeys: SearchKey[]): any[]
export type SearchKey =
  | string
  | {
      key: string
      fuzzy?: boolean
      boolean?: boolean
    }
