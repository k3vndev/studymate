import { databaseQuery } from '@/lib/utils/database/databaseQuery'
import { getUserId } from '@/lib/utils/getUserId'
import { response } from '@/lib/utils/response'
import { supabaseServerClient } from '@/lib/utils/supabaseServerClient'
import type { DBUserData } from '@types'

export const GET = async () => {
  const supabase = await supabaseServerClient()

  const userId = await getUserId({ supabase })
  if (userId === null) return response(false, 401)

  try {
    const [userData] = await databaseQuery<DBUserData[]>(
      supabase.from('users').select('id, user_name, avatar_url').eq('id', userId)
    )
    return response(true, 200, { data: userData })
  } catch {
    return response(false, 500)
  }
}
