import type { DBStudyplansLists } from '@/types'
import { databaseQuery } from '@api/utils/databaseQuery'
import { type SupabaseClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface Params {
  supabase?: SupabaseClient<any, 'public', any>
  userId: string
  key: keyof DBStudyplansLists['studyplans_lists']
  modifyId: string
}

/**
 * Utility function that allows to easily modify the user's studyplans lists (recommended, completed, saved) by adding or removing a studyplan id from them.
 * Every user has a `studyplans_lists` field in the database that contains three lists of studyplan ids: `recommended`, `completed`, and `saved`. This function allows to easily modify those lists by adding or removing a studyplan id from them.
 *
 * Note: Provide the `supabase` client as a parameter when possible to avoid creating a new client every time this function is called, which can lead to performance issues. The function will create a new client only if one is not provided.
 */
export const modifyStudyplansLists = ({
  supabase = createServerComponentClient({ cookies }),
  userId,
  key,
  modifyId
}: Params) => {
  // Get studyplans list
  const getStudyplansList = async () => {
    const data = await databaseQuery<DBStudyplansLists[]>(supabase.from('users').select('studyplans_lists'))
    return data[0].studyplans_lists
  }

  const saveChanges = async (studyplans_lists: DBStudyplansLists['studyplans_lists']) => {
    await databaseQuery(supabase.from('users').update({ studyplans_lists }).eq('id', userId))
  }

  return {
    add: async () => {
      const studyplansLists = await getStudyplansList()
      const existingIndex = studyplansLists[key].findIndex(k => k === modifyId)
      if (existingIndex !== -1) return false

      studyplansLists[key].push(modifyId)
      await saveChanges(studyplansLists)
      return true
    },

    remove: async () => {
      const studyplansLists = await getStudyplansList()
      const existingIndex = studyplansLists[key].findIndex(k => k === modifyId)
      if (existingIndex === -1) return false

      studyplansLists[key].splice(existingIndex, 1)
      await saveChanges(studyplansLists)
      return true
    }
  }
}
