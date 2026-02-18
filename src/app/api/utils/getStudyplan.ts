import { databaseQuery } from '@api/utils/databaseQuery'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PublicStudyplan } from '@types'
import { cookies } from 'next/headers'

interface Params {
  id: string
  supabase?: SupabaseClient<any, 'public', any>
}

export const getStudyplan = async <T>({
  id,
  supabase = createServerComponentClient({ cookies })
}: Params) => {
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
