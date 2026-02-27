import type { PublicStudyplan } from '@types'
import { databaseQuery } from '@utils/db/databaseQuery'
import { response } from '@utils/response'
import { supabaseServerClient } from '@utils/supabaseServerClient'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

// Get all studyplans
export const GET = async (req: NextRequest) => {
  let limit = 9999

  try {
    const url = new URL(req.url)
    const limitFromSearchParams = url.searchParams.get('limit')

    if (limitFromSearchParams !== null) {
      limit = await z.coerce.number().positive().parseAsync(limitFromSearchParams)
    }
  } catch {
    return response(false, 400, { msg: 'Invalid limit' })
  }

  const supabase = await supabaseServerClient()

  try {
    const data = await databaseQuery<PublicStudyplan[]>(
      supabase.from('studyplans').select('id, name, desc, category, daily_lessons').limit(limit)
    )
    return response(true, 200, { data })
  } catch {
    return response(false, 500)
  }
}

// Get studyplans by ids
export const POST = async (req: NextRequest) => {
  let idsList: string[]

  try {
    const data = await req.json()
    idsList = await z.array(z.string().uuid()).parseAsync(data)
  } catch {
    return response(false, 400, { msg: 'Id array is missing or invalid' })
  }

  const supabase = await supabaseServerClient()

  try {
    const data = await databaseQuery<PublicStudyplan[]>(
      supabase.from('studyplans').select('id, name, desc, category, daily_lessons').in('id', idsList)
    )
    return response(true, 200, { data })
  } catch {
    return response(false, 404)
  }
}
