import { databaseQuery } from '@/lib/utils/database/databaseQuery'
import type { SupabaseServerClient } from '@types'

interface Params {
  supabase: SupabaseServerClient
  userId: string
}

export const abandonStudyplanDB = async ({ supabase, userId }: Params) => {
  await databaseQuery(supabase.from('users').update({ studyplan: null }).eq('id', userId))
}
