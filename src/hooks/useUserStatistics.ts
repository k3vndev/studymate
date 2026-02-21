import { dataFetch } from '@/lib/utils/dataFetch'
import { useStatisticsStore } from '@/store/useStatisticsStore'
import type { StudySession } from '@types'
import { DateTime } from 'luxon'
import { useEffect } from 'react'

export const useUserStatistics = () => {
  const setSecondsFocusedToday = useStatisticsStore(s => s.setSecondsFocusedToday)
  const secondsFocusedToday = useStatisticsStore(s => s.secondsFocusedToday)

  /** Load today's focused seconds from the database */
  const fetchSecondsFocusedToday = async () => {
    // Generate ISO date string with timezone
    const date_end = new Date()
    date_end.setHours(23, 59, 59) // Set to end of the day

    const url = new URL('/api/study_sessions', window.location.origin)
    url.searchParams.set('date_end', date_end.toISOString())

    // Fetch study sessions from the API
    const sessions = await dataFetch<StudySession[]>({
      url: url.toString(),
      options: { method: 'GET' },
      onError: err => {
        console.error('Failed to fetch study sessions for statistics:', err)
      }
    })
    if (!sessions) return

    // Calculate seconds focused today
    let secondsFocusedToday = 0
    for (const { started_at, ended_at, last_ping_at } of sessions) {
      const start = DateTime.fromISO(started_at)
      const end = ended_at ? DateTime.fromISO(ended_at) : DateTime.fromISO(last_ping_at!)
      if (!start.isValid || !end.isValid) continue

      // Get the difference in seconds, ensuring we don't count time from previous days
      const sessionSeconds = Math.abs(end.diff(start, 'seconds').seconds)
      secondsFocusedToday += sessionSeconds
    }
    setSecondsFocusedToday(secondsFocusedToday)
  }

  // Load today's focused seconds on mount
  useEffect(() => {
    if (secondsFocusedToday === null) {
      fetchSecondsFocusedToday()
    }
  }, [])
}
