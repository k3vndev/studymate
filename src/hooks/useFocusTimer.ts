import { dataFetch } from '@/lib/utils/dataFetch'
import { getClientTimezone } from '@/lib/utils/getClientTimezone'
import { useStatisticsStore } from '@/store/useStatisticsStore'
import type { UpdateStudySessionReqBody } from '@/types'
import { CONTENT_JSON } from '@consts'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Custom hook to manage the focus timer logic,
 * including tracking seconds focused today and handling study session state.
 */
export const useFocusTimer = ({ studyplanId }: Params) => {
  const mainTimerIntervalRef = useRef<NodeJS.Timeout>()
  const secondsFocusedToday = useStatisticsStore(s => s.secondsFocusedToday)
  const setSecondsFocusedToday = useStatisticsStore(s => s.setSecondsFocusedToday)

  const startedAtMsRef = useRef(0)

  const studySessionIdRef = useRef<null | string>(null)
  const initialSecondsFocusedTodayRef = useRef(secondsFocusedToday)

  const canStartMainTimerRef = useRef(false)

  const [isStartingUp, setIsStartingUp] = useState(true)
  const [decorativeCircleStyle, setDecorativeCircleStyle] = useState<React.CSSProperties>()

  const startingUpIntervalRef = useRef<NodeJS.Timeout>()

  const HEART_BEAT_INTERVAL = {
    FIRST: 60 * 1000, // First heartbeat after 1 minute
    REGULAR: 5 * 60 * 1000 // Subsequent heartbeats every 5 minutes
  }
  const nextHeartBeatMSRef = useRef<number>(0)

  /*
    TODO:
    - Reset timer and notify the server when day changes. Server will handle everything and return the new session id for next day.
    - Load today's focused seconds from the database when the hook is first used.
  */

  const getElapsedMS = () => {
    const elapsedMs = Date.now() - startedAtMsRef.current
    return Math.max(0, elapsedMs)
  }

  const visibilityChangeHandler = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      setIsStartingUp(false)
      setDecorativeCircleStyle(undefined)
      startingUpIntervalRef.current && clearInterval(startingUpIntervalRef.current)
    } else {
      setIsStartingUp(true)
    }
  }, [])

  // Handle the startup timer, showing a progress circle for 10 seconds before starting the actual focus timer
  const initializeStartupTimer = () => {
    const startMs = Date.now()
    const waitSeconds = 1.5 // TODO: Change back to 10 seconds before release

    // Start interval to update the decorative circle style every few millisconds (circle progress bar)
    startingUpIntervalRef.current = setInterval(() => {
      const elapsedMs = Date.now() - startMs
      const progress = Math.min(elapsedMs / (waitSeconds * 1000), 1) // Progress from 0 to 1 over 10 seconds

      const range = [0.09, 0.033]
      const progressOpacity = range[0] + (range[1] - range[0]) * progress
      const backgroundOpacity = 0
      const degree = progress * 360

      const newStyle: React.CSSProperties = {
        background: `conic-gradient(rgba(255, 255, 255, ${progressOpacity}) ${degree}deg, rgba(255, 255, 255, ${backgroundOpacity}) ${degree}deg)`,
        animation: 'none'
      }
      setDecorativeCircleStyle(newStyle)

      // When progress reaches 100%, start the main timer and clear the startup timer interval
      if (progress >= 1) {
        setIsStartingUp(false)
        setDecorativeCircleStyle(undefined)
        canStartMainTimerRef.current = true

        startingUpIntervalRef.current && clearInterval(startingUpIntervalRef.current)
        document.removeEventListener('visibilitychange', visibilityChangeHandler)
      }
    }, 50)

    document.addEventListener('visibilitychange', visibilityChangeHandler)
  }

  // Handle the main focus timer, which starts after the startup timer finishes
  const initializeMainTimer = useCallback(() => {
    startedAtMsRef.current = Date.now()

    // Handle ticks
    const tick = async () => {
      const nextElapsedMS = getElapsedMS()
      setSecondsFocusedToday(initialSecondsFocusedTodayRef.current + Math.floor(nextElapsedMS / 1000))

      // If it's time for the next heartbeat, send update to the server
      const now = Date.now()
      const isTimeForNextHeartBeat = now >= nextHeartBeatMSRef.current

      if (studySessionIdRef.current && isTimeForNextHeartBeat) {
        // Set the next heartbeat time
        nextHeartBeatMSRef.current = now + HEART_BEAT_INTERVAL.REGULAR

        // Send update to the server with the new focused time
        const requestBody: UpdateStudySessionReqBody = {
          sessionId: studySessionIdRef.current,
          clientTimezone: getClientTimezone()
        }
        updateStudySession('PATCH', requestBody)
      }
    }
    mainTimerIntervalRef.current = setInterval(tick, 1000)

    // Make first call to the API and get the session id
    dataFetch<string>({
      url: '/api/study_sessions',
      options: {
        method: 'POST',
        headers: CONTENT_JSON,
        body: JSON.stringify({
          studyplanId: studyplanId,
          clientTimezone: getClientTimezone()
        })
      },
      onSuccess: studySessionId => {
        studySessionIdRef.current = studySessionId
        nextHeartBeatMSRef.current = Date.now() + HEART_BEAT_INTERVAL.FIRST
      }
    })
  }, [])

  // Used to send requests about the study session, either for heartbeats or ending the session
  const updateStudySession = useCallback((method: 'PATCH' | 'PUT', data: UpdateStudySessionReqBody) => {
    dataFetch({
      url: '/api/study_sessions',
      options: {
        method: method,
        headers: CONTENT_JSON,
        body: JSON.stringify(data)
      }
    })
  }, [])

  // Handle main state changes
  useEffect(() => {
    if (isStartingUp) {
      initializeStartupTimer()
    }
    // If the startup timer finishes and the main timer can start, start the main timer
    else if (canStartMainTimerRef.current) {
      initializeMainTimer()
    }
  }, [isStartingUp])

  // Handle component unmounting or user leaving the page
  useEffect(
    () => () => {
      // Clear intervals and event listeners
      mainTimerIntervalRef.current && clearInterval(mainTimerIntervalRef.current)
      startingUpIntervalRef.current && clearInterval(startingUpIntervalRef.current)
      document.removeEventListener('visibilitychange', visibilityChangeHandler)

      // If there's an active study session, send final update to the server to mark the session as completed
      if (studySessionIdRef.current) {
        updateStudySession('PUT', {
          sessionId: studySessionIdRef.current,
          clientTimezone: getClientTimezone()
        })
      }
    },
    []
  )

  const displayTimer = useMemo(() => {
    const hours = Math.floor(secondsFocusedToday / 3600)
    const minutes = Math.floor((secondsFocusedToday % 3600) / 60)
    const seconds = Math.floor(secondsFocusedToday % 60)

    const formattedHours = hours.toString().padStart(2, '0')
    const formattedMinutes = minutes.toString().padStart(2, '0')
    const formattedSeconds = seconds.toString().padStart(2, '0')

    return {
      h: formattedHours,
      m: formattedMinutes,
      s: formattedSeconds
    }
  }, [secondsFocusedToday])

  return {
    displayTimer,
    secondsFocusedToday,
    isStartingUp,
    decorativeCircleStyle
  }
}

interface Params {
  studyplanId: string
}
