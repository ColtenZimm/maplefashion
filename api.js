// Every maplestory.io call lives here. Region + version are pinned in one place.
const BASE = 'https://maplestory.io/api'
const REGION = 'GMS'
const VERSION = '255'

export const iconUrl = id => `${BASE}/${REGION}/${VERSION}/item/${id}/icon`

// ids -> character image URL (comma-separated URL-encoded {itemId, version} objects)
export const characterUrl = (ids, action) => {
  const items = ids
    .map(itemId => encodeURIComponent(JSON.stringify({ itemId, version: VERSION })))
    .join(',')
  return `${BASE}/character/${items}/${action}/0`
}

// Cash-shop items only, since those are what people buy.
export async function searchItems({ category, sub, search = '', start = 0, count = 30 }) {
  const q = new URLSearchParams({
    overallCategoryFilter: 'Equip', categoryFilter: category, subCategoryFilter: sub,
    cashFilter: 'true', searchFor: search, startPosition: start, count
  })
  const res = await fetch(`${BASE}/${REGION}/${VERSION}/item?${q}`)
  if (!res.ok) throw new Error(`maplestory.io ${res.status}`)
  return (await res.json()).map(({ id, name }) => ({ id, name }))
}
