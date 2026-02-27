import { type DependencyList, useEffect, useRef, useState } from 'react'

/**
 * Custom hook to execute a callback function whenever the day changes.
 * @param onDayChange Callback function to execute on day change
 * @param dependencies Optional dependencies array to control when the effect re-runs
 * @returns A boolean toggle that changes value whenever the day changes, useful for triggering re-renders
 */
export const useOnDayChange = (onDayChange?: () => void, dependencies: DependencyList = []) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onDayChangeRef = useRef(onDayChange)
  const [onDayChangeToggle, setOnDayChangeToggle] = useState(false)

  useEffect(() => {
    // Update the ref to the latest onDayChange function whenever it changes
    onDayChangeRef.current = onDayChange
    if (!onDayChangeRef.current) {
      timeoutRef.current && clearTimeout(timeoutRef.current)
      return
    }

    // Schedule the next run of the onDayChange callback at the next day change
    const scheduleNextRun = () => {
      timeoutRef.current && clearTimeout(timeoutRef.current)

      const nextDayMS = calculateNextDayChange()
      const msUntilNextDay = Math.max(nextDayMS - Date.now(), 0)

      timeoutRef.current = setTimeout(() => {
        onDayChangeRef.current?.()
        setOnDayChangeToggle(prev => !prev)

        scheduleNextRun()
      }, msUntilNextDay)
    }
    scheduleNextRun()

    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current)
    }
  }, [Boolean(onDayChange), ...dependencies])

  const calculateNextDayChange = () => {
    const now = new Date()
    const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    return nextDay.getTime()
  }

  return onDayChangeToggle
}
