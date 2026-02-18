import { response } from '@/app/api/utils/response'
import { BaseStudyplanSchema } from '@/lib/schemas/Studyplan'
import { abandonStudyplan } from '@api/utils/abandonStudyplan'
import { databaseQuery } from '@api/utils/databaseQuery'
import { getStudyplan } from '@api/utils/getStudyplan'
import { getUserId } from '@api/utils/getUserId'
import { modifyStudyplansLists } from '@api/utils/modifyStudyplansLists'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { BaseStudyplan, PublicStudyplan, StartStudyplanReqBody, UserStudyplan } from '@types'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

// Get user studyplan and current day
export const GET = async () => {
  const supabase = createServerComponentClient({ cookies })

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
  const supabase = createServerComponentClient({ cookies })
  let original_id: string | null = null

  const userId = await getUserId({ supabase })
  if (userId === null) return response(false, 401)

  let studyplan: BaseStudyplan

  if (typeof requestBody === 'string') {
    original_id = requestBody

    // Studyplan id was sent, try to find it in the database
    try {
      const data = await getStudyplan<PublicStudyplan>({ id: original_id, supabase })
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
    const newDailyLessons = studyplan.daily_lessons.map(d =>
      d.tasks.map(t => ({ goal: t, completed_at: null }))
    )
    const creatingStudyplan = {
      ...studyplan,
      daily_lessons: newDailyLessons
    }

    const createdStudyplan = await databaseQuery<UserStudyplan[]>(
      supabase
        .from('users')
        .update({
          studyplan: { ...creatingStudyplan, original_id: original_id }
        })
        .eq('id', userId)
        .select()
    )
    return response(true, 201, { data: createdStudyplan })
  } catch {
    return response(false, 500)
  }
}

// Abandon studyplan
export const DELETE = async () => {
  const supabase = createServerComponentClient({ cookies })

  const userId = await getUserId({ supabase })
  if (userId === null) return response(false, 401)

  try {
    await abandonStudyplan({ supabase, userId })
    return response(true, 200)
  } catch {
    return response(false, 500)
  }
}

// Complete studyplan
export const PUT = async () => {
  const supabase = createServerComponentClient({ cookies })

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
    await abandonStudyplan({ supabase, userId })
  } catch {
    return response(false, 500)
  }

  try {
    await modifyStudyplansLists({ supabase, modifyId: originalId, key: 'completed', userId }).add()
    return response(true, 200, { data: originalId })
  } catch {
    return response(false, 500)
  }
}
