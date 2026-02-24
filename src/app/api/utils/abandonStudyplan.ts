import { databaseQuery } from '@api/utils/databaseQuery'
import type { SupabaseServerClient } from '@types'

interface Params {
  supabase: SupabaseServerClient
  userId: string
}

export const abandonStudyplan = async ({ supabase, userId }: Params) => {
  await databaseQuery(supabase.from('users').update({ studyplan: null }).eq('id', userId))
}
