import { loadJSON, saveJSON } from './storage'

const ANON_ID_KEY = 'slogodle_anon_id_v1'

export function getAnonId(): string {
  let id = loadJSON<string | null>(ANON_ID_KEY, null)
  if (!id) {
    id = crypto.randomUUID()
    saveJSON(ANON_ID_KEY, id)
  }
  return id
}
