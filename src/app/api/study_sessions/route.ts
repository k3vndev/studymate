import { getUserId } from '@api/utils/getUserId'
import { response } from '@api/utils/response'
import { DB_ERROR_CODES } from '@consts'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { CreateStudySessionReqBody } from '@types'
import { DateTime, IANAZone } from 'luxon'
import { cookies } from 'next/headers'
import { z } from 'zod'

export const POST = async (req: Request) => {
  const supabase = createServerComponentClient({ cookies })

  // Authenticate user
  const userId = await getUserId({ supabase })
  if (userId === null) {
    return response(false, 401, { msg: 'Unauthorized' })
  }

  const body: CreateStudySessionReqBody = await req.json()
  let studyplanId: string
  let clientTimezone: string

  // Validate request body
  try {
    const parsed = await z
      .object({
        studyplanId: z.string().uuid(),
        clientTimezone: z.string()
      })
      .parseAsync(body)

    studyplanId = parsed.studyplanId
    clientTimezone = parsed.clientTimezone
  } catch {
    return response(false, 400, { msg: 'Invalid request body' })
  }

  // Validate timezone and convert client time to UTC
  if (!IANAZone.isValidZone(clientTimezone)) {
    return response(false, 400, { msg: 'Invalid timezone' })
  }
  const clientNow = DateTime.now().setZone(clientTimezone).toUTC().toISO()

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
