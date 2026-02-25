import { BaseStudyplanSchema } from '@/lib/schemas/Studyplan'
import { abandonStudyplanDB } from '@/lib/utils/database/abandonStudyplanDB'
import { databaseQuery } from '@/lib/utils/database/databaseQuery'
import { getStudyplanDB } from '@/lib/utils/database/getStudyplanDB'
import { modifyStudyplansListsDB } from '@/lib/utils/database/modifyStudyplansListsDB'
import { getUserId } from '@/lib/utils/getUserId'
import { response } from '@/lib/utils/response'
import { supabaseServerClient } from '@/lib/utils/supabaseServerClient'
import type { BaseStudyplan, PublicStudyplan, StartStudyplanReqBody, UserStudyplan } from '@types'
import type { NextRequest } from 'next/server'

// Get user studyplan and current day
export const GET = async () => {
  const supabase = await supabaseServerClient()

  const userId = await getUserId({ supabase })
  if (userId === null) return response(false, 401)

  try {
    type QueryResponse = { studyplan: UserStudyplan | null }
    const [queryResult] = await databaseQuery<QueryResponse[]>(supabase.from('users').select('studyplan'))

    if (!queryResult) {
      return response(true, 401, { msg: 'User not found' }) // This case should never happen as we have the userId from the auth, but we need to handle it anyway
    }

    const { studyplan } = queryResult
    return response(true, 200, { data: studyplan })
  } catch {
    return response(false, 500)
  }
}

// Start a studyplan
export const POST = async (req: NextRequest) => {
  const requestBody: StartStudyplanReqBody = await req.json()
  const supabase = await supabaseServerClient()
  let original_id: string | null = null

  const userId = await getUserId({ supabase })
  if (userId === null) return response(false, 401)

  let studyplan: BaseStudyplan

  if (typeof requestBody === 'string') {
    original_id = requestBody

    // Studyplan id was sent, try to find it in the database
    try {
      const data = await getStudyplanDB<PublicStudyplan>({ id: original_id, supabase })
      if (data === null) {
        return response(false, 404, { msg: 'Studyplan id not found' })
      }

      // Set studyplan to the one found in the database
      studyplan = data
    } catch {
      return response(false, 500)
    }
  } else {
    // A studyplan object was sent, validate its structure and set it as the studyplan to start
    try {
      const validatedStudyplan = await BaseStudyplanSchema.parseAsync(requestBody)
      studyplan = validatedStudyplan
    } catch {
      return response(false, 400, { msg: 'Studyplan missing or with invalid structure' })
    }
  }

  // Create a new studyplan if we don't have an original id (as it doesn't exist in the database yet)
  if (!original_id) {
    try {
      const [data] = await databaseQuery<PublicStudyplan[]>(
        supabase.from('studyplans').insert(studyplan).select()
      )
      original_id = data.id
    } catch {
      return response(false, 500)
    }
  }

  // Create user's studyplan
  try {
    // Parse daily lessons to match the UserStudyplan structure
    const daily_lessons = studyplan.daily_lessons.map(lesson => ({
      ...lesson,
      tasks: lesson.tasks.map(t => ({ goal: t, completed_at: null }))
    }))

    const creatingStudyplan: UserStudyplan = {
      ...studyplan,
      original_id,
      daily_lessons
    }

    type QueryResponse = { studyplan: UserStudyplan[] }

    await databaseQuery<QueryResponse>(
      supabase
        .from('users')
        .update({
          studyplan: creatingStudyplan
        })
        .eq('id', userId)
    )
    return response(true, 201, { data: creatingStudyplan })
  } catch {
    return response(false, 500)
  }
}

// Abandon studyplan
export const DELETE = async () => {
  const supabase = await supabaseServerClient()

  const userId = await getUserId({ supabase })
  if (userId === null) return response(false, 401)

  try {
    await abandonStudyplanDB({ supabase, userId })
    return response(true, 200)
  } catch {
    return response(false, 500)
  }
}

// Complete studyplan
export const PUT = async () => {
  const supabase = await supabaseServerClient()

  const userId = await getUserId({ supabase })
  if (userId === null) return response(false, 401)

  let originalId: string

  try {
    // Get original id
    type QueryResponse = { studyplan: UserStudyplan | null }
    const [{ studyplan }] = await databaseQuery<QueryResponse[]>(supabase.from('users').select('studyplan'))
    if (studyplan === null) {
      return response(false, 405, { msg: "User doesn't have a studyplan" })
    }

    const { original_id, daily_lessons } = studyplan
    originalId = original_id

    // Check if all tasks are done
    if (!daily_lessons.every(d => d.tasks.every(t => !!t.completed_at))) {
      return response(false, 403, { msg: 'All tasks must be completed before finishing the studyplan' })
    }

    // Abandon studyplan
    await abandonStudyplanDB({ supabase, userId })
  } catch {
    return response(false, 500)
  }

  try {
    await modifyStudyplansListsDB({ supabase, modifyId: originalId, key: 'completed', userId }).add()
    return response(true, 200, { data: originalId })
  } catch {
    return response(false, 500)
  }
}
