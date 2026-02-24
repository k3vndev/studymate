import { databaseQuery } from '@api/utils/databaseQuery'
import type { PublicStudyplan, SupabaseServerClient } from '@types'

interface Params {
  id: string
  supabase: SupabaseServerClient
}

export const getStudyplan = async <T>({ id, supabase }: Params) => {
  if (typeof id !== 'string') return null

  try {
    const data = await databaseQuery<PublicStudyplan[]>(
      supabase.from('studyplans').select('id, name, desc, category, daily_lessons').eq('id', id)
    )
    if (data === null || !data.length) return null
    return data[0] as T
  } catch {
    return null
  }
}
