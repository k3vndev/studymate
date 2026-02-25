import { CONTENT_JSON } from '@consts'
import { useUserStore } from '@store/useUserStore'
import type { CreateStudySessionReqBody, UpdateStudySessionReqBody } from '@types'
import { dataFetch } from '@utils/dataFetch'
import { getClientTimezone } from '@utils/getClientTimezone'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useUserStatistics } from './useUserStatistics'

/**
 * Custom hook to manage the focus timer logic,
 * including tracking seconds focused today and handling study session state.
 */
export const useFocusTimer = ({ studyplanId }: Params) => {
  const mainTimerIntervalRef = useRef<NodeJS.Timeout>(null)

  const startedAtMsRef = useRef(0)
  const studySessionIdRef = useRef<null | string>(null)
  const initialSecondsTodayRef = useRef<number | null>(null)
  const canStartMainTimerRef = useRef(false)

  const [isStartingUp, setIsStartingUp] = useState(true)
  const startingUpIntervalRef = useRef<NodeJS.Timeout>(null)
  const [decorativeCircleStyle, setDecorativeCircleStyle] = useState<React.CSSProperties>()

  const secondsFocusedToday = useUserStore(s => s.secondsFocusedToday)
  const setSecondsFocusedToday = useUserStore(s => s.setSecondsFocusedToday)
  const userStoreHydrated = useUserStore(s => s.hydrated)

  const { getSecondsFocusedToday } = useUserStatistics()

  const HEART_BEAT_INTERVAL = {
    FIRST: 60 * 1000, // First heartbeat after 1 minute
    REGULAR: 5 * 60 * 1000 // Subsequent heartbeats every 5 minutes
  }
  const nextHeartBeatMSRef = useRef<number>(0)

  // On initial load, calculate the seconds focused today from the user's study sessions and set it in the store
  useEffect(() => {
    if (userStoreHydrated && secondsFocusedToday === null && initialSecondsTodayRef.current === null) {
      const initialSeconds = getSecondsFocusedToday()
      initialSecondsTodayRef.current = initialSeconds
      setSecondsFocusedToday(initialSeconds)
    }
  }, [userStoreHydrated, secondsFocusedToday])

  // Handle the startup timer, showing a progress circle for 10 seconds before starting the actual focus timer
  const initializeStartupTimer = () => {
    const startMs = Date.now()
    const waitSeconds = 10

    // Start interval to update the decorative circle style every few millisconds (circle progress bar)
    startingUpIntervalRef.current = setInterval(() => {
      const elapsedMs = Date.now() - startMs
      const progress = Math.min(elapsedMs / (waitSeconds * 1000), 1) // Progress from 0 to 1 over 10 seconds

      const range = [0.1, 0.04]
      const progressOpacity = range[0] + (range[1] - range[0]) * progress
      const backgroundOpacity = 0
      const degree = progress * 360

      const newStyle: React.CSSProperties = {
        background: `
          conic-gradient(
            rgba(255, 255, 255, ${progressOpacity}) ${degree}deg,
            rgba(255, 255, 255, ${backgroundOpacity}) ${degree}deg
          )`,
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
  }

  // Handle the main focus timer, which starts after the startup timer finishes
  const initializeMainTimer = useCallback(() => {
    startedAtMsRef.current = Date.now()

    // Handle ticks, called every second
    const tick = async () => {
      const nextElapsedMS = getElapsedMS()

      if (initialSecondsTodayRef.current !== null) {
        setSecondsFocusedToday(initialSecondsTodayRef.current + Math.floor(nextElapsedMS / 1000))
      }

      // If it's time for the next heartbeat, send update to the server
      const now = Date.now()
      const isTimeForNextHeartBeat = now >= nextHeartBeatMSRef.current

      if (studySessionIdRef.current && isTimeForNextHeartBeat) {
        studySessionUpdater.ping()
        nextHeartBeatMSRef.current = now + HEART_BEAT_INTERVAL.REGULAR
      }

      // -- Handle day change --
      const startDate = new Date(startedAtMsRef.current)
      const nowDate = new Date()

      // Format dates as YYYY-MM-DD for comparison
      const formatDate = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      const startDateStr = formatDate(startDate)
      const nowDateStr = formatDate(nowDate)

      if (startDateStr !== nowDateStr) {
        // Clear the main timer interval while we handle the day change
        mainTimerIntervalRef.current && clearInterval(mainTimerIntervalRef.current)
        initialSecondsTodayRef.current = 0
        setSecondsFocusedToday(0)

        // End the current study session for the previous day
        await studySessionUpdater.end()

        // Start a new study session for the new day
        studySessionIdRef.current = null
        initializeMainTimer()
      }
    }
    mainTimerIntervalRef.current = setInterval(tick, 1000)

    // Make first call to the API and get the session id
    createNewSession()
  }, [])

  const createNewSession = () => {
    const requestBody: CreateStudySessionReqBody = {
      studyplanId: studyplanId,
      clientTimezone: getClientTimezone()
    }

    return dataFetch<string>({
      url: '/api/study_sessions',
      options: {
        method: 'POST',
        headers: CONTENT_JSON,
        body: JSON.stringify(requestBody)
      },
      onSuccess: sessionId => {
        studySessionIdRef.current = sessionId
        nextHeartBeatMSRef.current = Date.now() + HEART_BEAT_INTERVAL.FIRST
      }
    })
  }

  /** Used to send requests about the study session, either for heartbeats or ending the session. */
  const studySessionUpdater = useMemo(() => {
    const _main = (method: 'PATCH' | 'PUT') => {
      const data: UpdateStudySessionReqBody = {
        sessionId: studySessionIdRef.current!,
        clientTimezone: getClientTimezone()
      }
      return dataFetch<string | undefined>({
        url: '/api/study_sessions',
        options: {
          method: method,
          headers: CONTENT_JSON,
          body: JSON.stringify(data)
        }
      })
    }
    return {
      ping: () => _main('PATCH'),
      end: () => _main('PUT')
    }
  }, [])

  // Handle main state changes
  useEffect(() => {
    // -- Set up visibility change listener to handle user switching tabs or minimizing the window --
    if (isStartingUp) {
      document.addEventListener('visibilitychange', visibilityChangeHandler)

      if (document.visibilityState !== 'visible') {
        setIsStartingUp(false)
        return
      }

      initializeStartupTimer()
      return
    }

    initializeMainTimer()

    // Clean up event listener on unmount
    return () => {
      document.removeEventListener('visibilitychange', visibilityChangeHandler)
    }
  }, [isStartingUp])

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

  const displayTimer = useMemo(() => {
    const value = secondsFocusedToday ?? 0

    const hours = Math.floor(value / 3600)
    const minutes = Math.floor((value % 3600) / 60)
    const seconds = Math.floor(value % 60)

    const formattedHours = hours.toString().padStart(2, '0')
    const formattedMinutes = minutes.toString().padStart(2, '0')
    const formattedSeconds = seconds.toString().padStart(2, '0')

    return {
      h: formattedHours,
      m: formattedMinutes,
      s: formattedSeconds
    }
  }, [secondsFocusedToday])

  // Handle component unmounting or user leaving the page
  useEffect(
    () => () => {
      // Clear intervals and event listeners
      mainTimerIntervalRef.current && clearInterval(mainTimerIntervalRef.current)
      startingUpIntervalRef.current && clearInterval(startingUpIntervalRef.current)
      document.removeEventListener('visibilitychange', visibilityChangeHandler)

      // If there's an active study session, send final update to the server to mark the session as completed
      if (studySessionIdRef.current) {
        studySessionUpdater.end()
      }
    },
    []
  )

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
