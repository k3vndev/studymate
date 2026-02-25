import { useUserStore } from '@store/useUserStore'
import { DateTime } from 'luxon'
import { useCallback } from 'react'

/**
 * Custom hook to provide user statistics related to study sessions.
 * @returns An object containing functions to retrieve various user statistics.
 */
export const useUserStatistics = () => {
  const studySessions = useUserStore(s => s.studySessions)
  const hydrated = useUserStore(s => s.hydrated)

  /**
   * Get the total number of seconds the user has focused today by processing their study sessions.
   * Consider memoizing this function to avoid unnecessary recalculations.
   * @returns The total seconds focused today, or null if study sessions are not available.
   */
  const getSecondsFocusedToday = useCallback(() => {
    if (studySessions) {
      const startOfToday = DateTime.local()
      return calcSecondsFocusedADay(startOfToday)
    }
    return null
  }, [studySessions, hydrated])

  const getDailyFocusedHours = useCallback((): DailyFocusedHours[] | null => {
    if (!studySessions) return null

    const newStudySessions = [...studySessions]
    const dailyFocusedSecondsMap: Record<string, number> = {}

    for (const { started_at, last_ping_at, ended_at } of newStudySessions) {
      const sessionSeconds = calcSessionSeconds(started_at, last_ping_at, ended_at)
      const date = DateTime.fromISO(started_at).toFormat('yyyy-MM-dd')

      if (dailyFocusedSecondsMap[date]) {
        dailyFocusedSecondsMap[date] += sessionSeconds
        continue
      }
      dailyFocusedSecondsMap[date] = sessionSeconds
    }

    // biome-ignore format: <>
    const array: DailyFocusedHours[] = Object
      .entries(dailyFocusedSecondsMap)
      .map(([date, seconds]) => ({ date, hours: seconds / 3600 }))
      .sort((a, b) => DateTime.fromISO(a.date).toMillis() - DateTime.fromISO(b.date).toMillis())

    return array
  }, [studySessions, hydrated])

  /**
   * Helper function to calculate the difference in seconds between two ISO date strings.
   * Params use ISO date strings. Returns the absolute difference in seconds, or 0 if either date is invalid.
   */
  const calcSessionSeconds = (start: string, ping: string | null, end: string | null) => {
    if (!ping && !end) return 0

    const startTime = DateTime.fromISO(start)
    const endTime = end ? DateTime.fromISO(end) : DateTime.fromISO(ping!)
    if (!startTime.isValid || !endTime.isValid) return 0

    return Math.abs(endTime.diff(startTime, 'seconds').seconds)
  }

  /**
   * Helper function to calculate the total seconds focused for a specific day based on study sessions.
   * @param date - The date for which to calculate the focused seconds.
   * @returns The total seconds focused on the specified day, or null if study sessions are not available.
   */
  const calcSecondsFocusedADay = useCallback(
    (date: DateTime) => {
      if (!studySessions) return null

      const startOfDay = date.startOf('day')

      // Extract seconds focused from study sessions
      let secondsFocusedToday = 0
      for (const { started_at, ended_at, last_ping_at } of studySessions) {
        // Skip sessions that started before the specified day
        const startedAt = DateTime.fromISO(started_at)
        if (startedAt < startOfDay) continue

        // Calculate the end time of the session, using last_ping_at if ended_at is not available
        const sessionSeconds = calcSessionSeconds(started_at, last_ping_at, ended_at)
        secondsFocusedToday += sessionSeconds
      }
      return secondsFocusedToday
    },
    [studySessions, hydrated]
  )

  return {
    getSecondsFocusedToday,
    getDailyFocusedHours,
    calcSessionSeconds,
    calcSecondsFocusedADay
  }
}

export interface DailyFocusedHours {
  date: string
  hours: number
}
