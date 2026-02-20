import { MIN_SESSION_DURATION } from '@/consts'
import { useStatisticsStore } from '@/store/useStatisticsStore'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Custom hook to manage the focus timer logic,
 * including tracking seconds focused today and handling study session state.
 */
export const useFocusTimer = () => {
  const timerDisplayIntervalRef = useRef<NodeJS.Timeout>()
  const secondsFocusedToday = useStatisticsStore(s => s.secondsFocusedToday)
  const setSecondsFocusedToday = useStatisticsStore(s => s.setSecondsFocusedToday)

  const startedAtMsRef = useRef(0)

  const studySessionIdRef = useRef<null | string>(null)
  const initialSecondsFocusedTodayRef = useRef(secondsFocusedToday)

  const canStartMainTimerRef = useRef(false)

  const [isStartingUp, setIsStartingUp] = useState(true)
  const [decorativeCircleStyle, setDecorativeCircleStyle] = useState<React.CSSProperties>()

  const startingUpIntervalRef = useRef<NodeJS.Timeout>()

  /*
    TODO:
    - Add encouraging messages under the timer.
    - Every 5 minutes, send an update to the server using PATH method with the session id, to update the minutes focused in the study_session row. This way, if the user closes the app, we still have the data up to the last 5 minutes.
    - When the user finishes the study session, send a final update to the server to mark the session as completed using the session id and PUT method.
    - Reset timer and notify the server when day changes. Server will handle everything and return the new session id for next day.
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
    const waitSeconds = 10

    // Start interval to update the decorative circle style every few millisconds (circle progress bar)
    startingUpIntervalRef.current = setInterval(() => {
      const elapsedMs = Date.now() - startMs
      const progress = Math.min(elapsedMs / (waitSeconds * 1000), 1) // Progress from 0 to 1 over 10 seconds

      const range = [0.1, 0.05]
      const progressOpacity = range[0] + (range[1] - range[0]) * progress
      const backgroundOpacity = 0
      const degree = progress * 360

      const newStyle: React.CSSProperties = {
        background: `conic-gradient(rgba(255, 255, 255, ${progressOpacity}) ${degree}deg, rgba(255, 255, 255, ${backgroundOpacity}) ${degree}deg)`,
        animation: 'none'
      }
      setDecorativeCircleStyle(newStyle)

      // After 10 seconds, set isStartingUp to false, which will trigger the useEffect below to start the actual timer
      if (progress >= 1) {
        setIsStartingUp(false)
        startingUpIntervalRef.current && clearInterval(startingUpIntervalRef.current)
        setDecorativeCircleStyle(undefined)
        canStartMainTimerRef.current = true

        document.removeEventListener('visibilitychange', visibilityChangeHandler)
      }
    }, 50)

    document.addEventListener('visibilitychange', visibilityChangeHandler)
  }

  // Handle the main focus timer, which starts after the startup timer finishes
  const initializeMainTimer = useCallback(() => {
    startedAtMsRef.current = Date.now()

    // Handle ticks
    const tick = () => {
      const nextElapsedMS = getElapsedMS()
      setSecondsFocusedToday(initialSecondsFocusedTodayRef.current + Math.floor(nextElapsedMS / 1000))
    }
    timerDisplayIntervalRef.current = setInterval(tick, 1000)

    // Make first call to the API and get the session id
  }, [])

  useEffect(() => {
    if (isStartingUp) {
      initializeStartupTimer()
      return
    }

    canStartMainTimerRef.current && initializeMainTimer()

    return () => {
      // Clear the interval when the component unmounts to prevent memory leaks
      timerDisplayIntervalRef.current && clearInterval(timerDisplayIntervalRef.current)
      startingUpIntervalRef.current && clearInterval(startingUpIntervalRef.current)
      document.removeEventListener('visibilitychange', visibilityChangeHandler)
    }
  }, [isStartingUp])

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
