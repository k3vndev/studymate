import type { UserStudyplan } from '@types'
import { DateTime, IANAZone } from 'luxon'

/**
 * Returns utility values related to the user's Studyplan.
 *
 * - `todaysTasks`: tasks for the current day of the Studyplan. If the Studyplan is completed, it will return the tasks of the last day.
 *
 * - `isOnLastDay`: whether the user is on the last day of the Studyplan or not. If the Studyplan is completed, it will return true.
 *
 * - `currentStudyplanDay`: the one-indexed current day of the Studyplan that the user is on. If the Studyplan is completed, it will return the last day.
 *
 * - `studyplanIsCompleted`: whether the user has completed all the tasks of the Studyplan or not. This is not related to completion state on database, it's calculated based on the completed_at values of the tasks.
 *
 *  - `areTodaysTasksAllDone`: whether the user has completed all of today's tasks or not. If the Studyplan is completed, it will return true.
 *
 * @param userStudyplan the UserStudyplan to evaluate
 * @param timezone the user's timezone in IANA format (e.g. "Europe/Paris")
 */
export const evaluateUserStudyplan = (
  userStudyplan: UserStudyplan,
  timezone: string
): EvaluateUserStudyplanReturn => {
  if (!IANAZone.isValidZone(timezone)) {
    throw new Error('Invalid timezone')
  }

  /** One-indexed current Studyplan day  */
  let currentDay: number | null = null
  let hasCompletedATaskToday = false

  const { daily_lessons } = userStudyplan

  // Get the current day of the Studyplan and if the user has completed at least one task today
  for (let i = 0; i < daily_lessons.length; i++) {
    const { tasks } = daily_lessons[i]
    hasCompletedATaskToday = false

    // Check if the user has completed at least one task today and get the current day of the Studyplan
    for (let j = 0; j < tasks.length; j++) {
      const task = tasks[j]

      if (task.completed_at !== null) {
        hasCompletedATaskToday = true
      } else {
        currentDay = i + 1 // Days are 1-indexed
      }
    }

    if (currentDay) {
      break
    }
  }

  if (!currentDay) {
    // Every task was completed, the Studyplan is completed
    const currentDay = daily_lessons.length
    const todaysTasks = daily_lessons[currentDay - 1].tasks

    return {
      todaysTasks,
      isOnLastDay: true,
      currentDay,
      studyplanIsCompleted: true,
      areTodaysTasksAllDone: true
    }
  }

  if (!hasCompletedATaskToday && currentDay > 1) {
    // -- User is just starting today's tasks, check if the previous day tasks were completed yesterday at the latest --
    const yesterdaysLesson = daily_lessons[currentDay - 2]
    const today = DateTime.now().setZone(timezone)

    for (const task of yesterdaysLesson.tasks) {
      if (task.completed_at === null) {
        throw new Error("User has not completed yesterday's tasks yet. This error should never happen.")
      }

      const completedAt = DateTime.fromISO(task.completed_at, { zone: 'utc' }).setZone(timezone)
      const wasCompletedToday = completedAt.hasSame(today, 'day')

      if (wasCompletedToday) {
        // User completed yesterday's tasks today, so they are still on yesterday's tasks
        currentDay--
        break
      }
    }
  }

  const todaysTasks = daily_lessons[currentDay - 1].tasks
  const isOnLastDay = currentDay === daily_lessons.length
  const areTodaysTasksAllDone = !todaysTasks.some(task => task.completed_at === null)

  return {
    todaysTasks,
    areTodaysTasksAllDone,
    isOnLastDay,
    currentDay,
    studyplanIsCompleted: false
  }
}

export interface EvaluateUserStudyplanReturn {
  todaysTasks: UserStudyplan['daily_lessons'][number]['tasks']
  isOnLastDay: boolean
  currentDay: number
  studyplanIsCompleted: boolean
  areTodaysTasksAllDone: boolean
}
