import type { SupabaseServerClient } from '@types'
import { databaseQuery } from '@utils/db/databaseQuery'

interface Params {
  supabase: SupabaseServerClient
  userId: string
}

export const abandonStudyplanDB = async ({ supabase, userId }: Params) => {
  await databaseQuery(supabase.from('users').update({ studyplan: null }).eq('id', userId))
}
