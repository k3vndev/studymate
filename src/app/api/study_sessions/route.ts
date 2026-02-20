import { getClientTimestamp } from '@api/utils/getClientTimestamp'
import { getUserId } from '@api/utils/getUserId'
import { handleStudySessionUpdate } from '@api/utils/handleStudySessionUpdate'
import { response } from '@api/utils/response'
import { DB_ERROR_CODES } from '@consts'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { CreateStudySessionReqBody } from '@types'
import { DateTime } from 'luxon'
import { cookies } from 'next/headers'
import { z } from 'zod'

// API route to get study sessions for a specific day or studyplan
// Supports query parameters:
// - studyplan_id (optional): filter sessions by studyplan
// - start (optional): ISO date string to filter sessions that started on or after this date
// - end (optional): ISO date string to filter sessions that started on or before this date
export const GET = async (req: Request) => {
  const supabase = createServerComponentClient({ cookies })

  const { searchParams } = new URL(req.url)
  let studyplanId = searchParams.get('studyplan_id')
  let start: string | null
  let end: string | null

  // Valiate studyplan_id if provided
  try {
    studyplanId = z.string().uuid().nullable().parse(studyplanId)
  } catch {
    return response(false, 400, { msg: 'Invalid studyplan_id query parameter' })
  }

  // Validate dates if provided (should be an ISO string)
  try {
    ;[start, end] = ['start', 'end'].map(param => {
      const val = searchParams.get(param)
      if (val === null) return null

      if (!DateTime.fromISO(val).isValid) {
        throw new Error(`Invalid ${param} date format, expected ISO string`)
      }
      return val
    })
  } catch {
    return response(false, 400, { msg: 'Invalid date query parameters (start, end)' })
  }

  // Authenticate user
  const userId = await getUserId({ supabase })
  if (userId === null) return response(false, 401, { msg: 'Unauthorized' })

  // Fetch study sessions from the database for the user, applying filters if provided
  try {
    let query = supabase.from('study_sessions').select('*').eq('user_id', userId)

    if (studyplanId) query = query.eq('studyplan_id', studyplanId)
    if (start) query = query.gte('started_at', start)
    if (end) query = query.lt('started_at', end)

    const { data, error } = await query
    if (error || !data) throw error

    return response(true, 200, { data })
  } catch {
    return response(false, 500)
  }
}

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

// API method to handle study session heartbeats or pings.
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
