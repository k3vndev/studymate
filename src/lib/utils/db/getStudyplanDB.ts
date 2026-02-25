import type { PublicStudyplan, SupabaseServerClient } from '@types'
import { databaseQuery } from '@utils/db/databaseQuery'

interface Params {
  id: string
  supabase: SupabaseServerClient
}

export const getStudyplanDB = async <T>({ id, supabase }: Params) => {
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
