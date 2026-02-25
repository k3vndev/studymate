import { BaseStudyplanSchema } from '@/lib/schemas/Studyplan'
import { databaseQuery } from '@/lib/utils/database/databaseQuery'
import { modifyStudyplansListsDB } from '@/lib/utils/database/modifyStudyplansListsDB'
import { getUserId } from '@/lib/utils/getUserId'
import { response } from '@/lib/utils/response'
import { supabaseServerClient } from '@/lib/utils/supabaseServerClient'
import type { BaseStudyplan, PublicStudyplan } from '@types'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

// Save or un-save an existing studyplan
export const PATCH = async (req: NextRequest) => {
  const supabase = await supabaseServerClient()
  let studyplanId: string
  let saveStudyplan: boolean

  // Check if user is authenticated
  const userId = await getUserId({ supabase })
  if (userId === null) return response(false, 401, { msg: 'Unauthorized' })

  // Parse the request body
  try {
    const reqBody = await req.json()
    const { id, save } = await z
      .object({
        id: z.string().uuid(),
        save: z.boolean()
      })
      .parseAsync(reqBody)

    studyplanId = id
    saveStudyplan = save
  } catch {
    return response(false, 400, { msg: 'Invalid request body' })
  }

  try {
    const action = saveStudyplan ? 'add' : 'remove'

    // Save or un-save studyplan
    const wasSavedOrNot = await modifyStudyplansListsDB({
      supabase,
      userId,
      key: 'saved',
      modifyId: studyplanId
    })[action]()

    if (!wasSavedOrNot) {
      const prefix = saveStudyplan ? '' : 'un-'
      return response(false, 400, { msg: `Nothing happened, studyplan was already ${prefix}saved` })
    }
    return response(true, 200)
  } catch {
    return response(false, 500)
  }
}

// Publish a studyplan and save it
export const POST = async (req: NextRequest) => {
  const supabase = await supabaseServerClient()
  let studyplanFromReq: BaseStudyplan

  // Check if user is authenticated
  const userId = await getUserId({ supabase })
  if (userId === null) return response(false, 401, { msg: 'Unauthorized' })

  // Parse the request body
  try {
    const reqBody = await req.json()
    studyplanFromReq = await BaseStudyplanSchema.parseAsync(reqBody)
  } catch {
    return response(false, 400, { msg: 'Invalid request body' })
  }

  // Publish studyplan and save it
  try {
    const [publishedStudyplan] = await databaseQuery<PublicStudyplan[]>(
      supabase.from('studyplans').insert(studyplanFromReq).select()
    )
    const { id } = publishedStudyplan

    // Add studyplan to saved list
    await modifyStudyplansListsDB({
      supabase,
      userId,
      key: 'saved',
      modifyId: id
    }).add()

    return response(true, 200, { data: id })
  } catch {
    return response(false, 500)
  }
}
