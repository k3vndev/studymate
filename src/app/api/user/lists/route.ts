import { response } from '@/app/api/utils/response'
import { supabaseServerClient } from '@/app/api/utils/supabaseServerClient'
import { databaseQuery } from '@api/utils/databaseQuery'
import type { DBStudyplansLists } from '@types'

export const GET = async () => {
  const supabase = await supabaseServerClient()

  try {
    const data = await databaseQuery<DBStudyplansLists[]>(supabase.from('users').select('studyplans_lists'))

    if (data.length === 0) {
      return response(false, 401)
    }

    const [{ studyplans_lists }] = data
    return response(true, 200, { data: studyplans_lists })
  } catch {
    return response(false, 500)
  }
}
