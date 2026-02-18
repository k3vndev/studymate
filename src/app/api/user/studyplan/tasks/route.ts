import { evaluateUserStudyplan } from '@/lib/utils/evaluateUserStudyplan'
import { databaseQuery } from '@api/utils/databaseQuery'
import { getUserId } from '@api/utils/getUserId'
import { response } from '@api/utils/response'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { CompleteTaskReqBody, UserStudyplan } from '@types'
import { DateTime, IANAZone } from 'luxon'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

// Complete a task.
// Recieves a CompleteTaskReqBody object, responds with the completed task's completion timestamp if the request was successful
export const POST = async (req: NextRequest) => {
  const supabase = createServerComponentClient({ cookies })

  let newStudyplan: UserStudyplan
  let taskIndex: number
  let userTimezone: string

  try {
    const { index, clientTimezone }: CompleteTaskReqBody = await req.json()

    // Validate client timezone and task index before setting them
    if (!IANAZone.isValidZone(clientTimezone)) throw new Error()

    userTimezone = clientTimezone
    taskIndex = await z.number().nonnegative().parseAsync(index)
  } catch {
    return response(false, 400, { msg: 'Task index or client timezone is missing or invalid' })
  }

  // Get user id from Supabase auth
  const userId = await getUserId({ supabase })
  if (userId === null) return response(false, 401, { msg: 'Unauthorized' })

  let taskCompletionTimestamp: string

  try {
    // Fetch user's Studyplan from database
    type QueryResponse = { studyplan: UserStudyplan | null }
    const [{ studyplan }] = await databaseQuery<QueryResponse[]>(supabase.from('users').select('studyplan'))
    if (studyplan === null) {
      return response(false, 405, { msg: "User doesn't have a studyplan" })
    }

    if (studyplan === undefined) {
      return response(false, 500) // This should never happen, but it's here just in case
    }

    const {
      currentDay: currentStudyplanDay,
      areTodaysTasksAllDone,
      studyplanIsCompleted,
      todaysTasks
    } = evaluateUserStudyplan(studyplan, userTimezone)

    newStudyplan = { ...studyplan }

    if (studyplanIsCompleted) {
      return response(false, 405, { msg: 'Studyplan is already completed' })
    }

    if (areTodaysTasksAllDone) {
      // The user has completed all tasks for today and its trying to complete another one before the day changes
      return response(false, 405, {
        msg: "User has already completed today's tasks. Please wait until tomorrow to complete more tasks"
      })
    }

    // Try to mark the task as completed in the newStudyplan. If the task index is out of bounds, return an error
    try {
      const taskToComplete = todaysTasks[taskIndex]

      if (!taskToComplete || taskToComplete.completed_at) {
        return response(false, 400, { msg: 'Invalid task index or task is already completed' })
      }

      // Set task as completed with the current timestamp in the user's timezone
      const today = DateTime.now().setZone(userTimezone)
      taskCompletionTimestamp = today.toUTC().toISO() ?? '' // This should never be null, but it's here just in case
      newStudyplan.daily_lessons[currentStudyplanDay - 1].tasks[taskIndex].completed_at =
        taskCompletionTimestamp
    } catch {
      return response(false, 400, { msg: 'Invalid task index' })
    }
  } catch {
    return response(false, 500)
  }

  // Update user's Studyplan in database with the new completed task
  try {
    await databaseQuery(supabase.from('users').update({ studyplan: newStudyplan }).eq('id', userId))
    return response(true, 200, { data: taskCompletionTimestamp })
  } catch {
    return response(false, 500)
  }
}
