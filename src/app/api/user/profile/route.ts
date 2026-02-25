import type { DBUserData } from '@types'
import { databaseQuery } from '@utils/db/databaseQuery'
import { getUserId } from '@utils/getUserId'
import { response } from '@utils/response'
import { supabaseServerClient } from '@utils/supabaseServerClient'

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
