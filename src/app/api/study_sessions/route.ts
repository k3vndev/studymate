import { getClientTimestamp } from '@api/utils/getClientTimestamp'
import { getUserId } from '@api/utils/getUserId'
import { handleStudySessionUpdate } from '@api/utils/handleStudySessionUpdate'
import { response } from '@api/utils/response'
import { DB_ERROR_CODES } from '@consts'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { CreateStudySessionReqBody } from '@types'
import { cookies } from 'next/headers'
import { z } from 'zod'

// API route to handle study session creation and updates (heartbeats and completion)
export const POST = async (req: Request) => {
  const supabase = createServerComponentClient({ cookies })

  const body: CreateStudySessionReqBody = await req.json()
  let studyplanId: string
  let clientTimezone: string

  // Validate request body
  try {
    const parsed = await z
      .object({
        studyplanId: z.string(),
        clientTimezone: z.string()
      })
      .parseAsync(body)

    studyplanId = parsed.studyplanId
    clientTimezone = parsed.clientTimezone
  } catch {
    return response(false, 400, { msg: 'Invalid request body' })
  }

  // Authenticate user
  const userId = await getUserId({ supabase })
  if (userId === null) {
    return response(false, 401, { msg: 'Unauthorized' })
  }

  // Validate timezone and convert client time to UTC
  const clientNow = getClientTimestamp(clientTimezone)
  if (!clientNow) return response(false, 400, { msg: 'Invalid timezone' })

  // Create new study session in the database, linked to the user and studyplan
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({ user_id: userId, studyplan_id: studyplanId, started_at: clientNow })
      .select('*')
      .single()

    if (error?.code === DB_ERROR_CODES.NONEXISTENT_FOREIGN_KEY) {
      console.error('Attempted to create a study session for a non-existent studyplan:', studyplanId)
      return response(false, 404, { msg: 'Referenced studyplan does not exist' })
    }
    if (error || !data) throw error

    // Successfully created study session, return the session id to the client
    return response(true, 201, { data: data.id })
  } catch (error) {
    console.error('Unexpected error while creating study session:', error)
    return response(false, 500)
  }
}

// API method to handle both study session heartbeats or pings.
export const PATCH = async (req: Request) => {
  try {
    return await handleStudySessionUpdate(req, 'last_ping_at')
  } catch {
    return response(false, 500)
  }
}

// API method to handle study session completion
export const PUT = async (req: Request) => {
  try {
    return await handleStudySessionUpdate(req, 'ended_at')
  } catch {
    return response(false, 500)
  }
}
