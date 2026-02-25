import { useUserStore } from '@store/useUserStore'
import { DateTime } from 'luxon'
import { useCallback } from 'react'

/**
 * Custom hook to provide user statistics related to study sessions.
 * @returns An object containing functions to retrieve various user statistics.
 */
export const useUserStatistics = () => {
  const studySessions = useUserStore(s => s.userStudySessions)

  /**
   * Get the total number of seconds the user has focused today by processing their study sessions.
   * Consider memoizing this function to avoid unnecessary recalculations.
   * @returns The total seconds focused today, or null if study sessions are not available.
   */
  const getSecondsFocusedToday = useCallback(() => {
    if (!studySessions) return null

    // First, filter study sessions to only include those that started today
    const startOfToday = DateTime.local().startOf('day')
    const sessionsToday = studySessions.filter(session => {
      const startedAt = DateTime.fromISO(session.started_at)
      return startedAt >= startOfToday
    })

    // Extract seconds focused from study sessions
    let secondsFocusedToday = 0
    for (const { started_at, ended_at, last_ping_at } of sessionsToday) {
      const start = DateTime.fromISO(started_at)
      const end = ended_at ? DateTime.fromISO(ended_at) : DateTime.fromISO(last_ping_at!)
      if (!start.isValid || !end.isValid) continue

      // Get the difference in seconds, ensuring we don't count time from previous days
      const sessionSeconds = Math.abs(end.diff(start, 'seconds').seconds)
      secondsFocusedToday += sessionSeconds
    }
    return secondsFocusedToday
  }, [studySessions])

  // TODO: Add more statistics functions here. Such as daily streak, average focus time, etc.

  return { getSecondsFocusedToday }
}
