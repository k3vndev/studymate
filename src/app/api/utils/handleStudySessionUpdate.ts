import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { getClientTimestamp } from './getClientTimestamp'
import { getUserId } from './getUserId'
import { response } from './response'

/**
 * Utility function to handle study session updates, used by both the PATCH and PUT API methods for updating the last_ping_at field (heartbeats) or the ended_at field (completion) of a study session.
 * This function exists to avoid code duplication since both API methods have very similar logic, the only difference being the field that is updated in the database.
 *
 * @param req The incoming request object
 * @param db_key The database field to update ('last_ping_at' or 'ended_at')
 * @returns A response object indicating the success or failure of the operation
 */
export const handleStudySessionUpdate = async (req: Request, db_key: 'last_ping_at' | 'ended_at') => {
  const supabase = createServerComponentClient({ cookies })
  const body = await req.json()

  let sessionId: string
  let clientTimezone: string

  // Validate request body
  try {
    const parsed = await z
      .object({
        sessionId: z.string(),
        clientTimezone: z.string()
      })
      .parseAsync(body)

    sessionId = parsed.sessionId
    clientTimezone = parsed.clientTimezone
  } catch {
    return response(false, 400, { msg: 'Invalid request body' })
  }

  // Authenticate user
  const userId = await getUserId({ supabase })
  if (userId === null) return response(false, 401, { msg: 'Unauthorized' })

  // Validate timezone and convert client time to UTC
  const clientNow = getClientTimestamp(clientTimezone)
  if (!clientNow) return response(false, 400, { msg: 'Invalid timezone' })

  try {
    // Update the study session's last_ping_at field to the current client time
    const { data, error } = await supabase
      .from('study_sessions')
      .update({ [db_key]: clientNow })
      .eq('id', sessionId)
      .select('*')

    if (error || !data) throw error

    if (data.length === 0) {
      console.error('Attempted to update a non-existent study session:', sessionId)
      return response(false, 404, { msg: 'Study session not found!' })
    }

    // Successfully updated study session. No need to return any data to the client
    return response(true, 200)
  } catch (error) {
    console.error(`Unexpected error while updating study session's ${db_key}:`, error)
    return response(false, 500)
  }
}
