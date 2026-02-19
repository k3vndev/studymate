import { useStatisticsStore } from '@/store/useStatisticsStore'
import { FONTS } from '@consts'
import { useEffect, useMemo, useRef, useState } from 'react'

export const Timer = () => {
  const intervalRef = useRef<NodeJS.Timeout>()
  const minutesFocusedToday = useStatisticsStore(s => s.minutesFocusedToday)
  const setMinutesFocusedToday = useStatisticsStore(s => s.setMinutesFocusedToday)

  const [secondsCounter, setSecondsCounter] = useState(0)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsCounter(s => {
        if (s >= 59) {
          setMinutesFocusedToday(m => m + 1)
          return 0
        }
        return s + 1
      })
    }, 1000)

    return () => {
      // Clear the interval when the component unmounts to prevent memory leaks
      intervalRef.current && clearInterval(intervalRef.current)
    }
  }, [])

  const displayTimer = useMemo(() => {
    const hours = Math.floor(minutesFocusedToday / 60)
    const minutes = minutesFocusedToday % 60
    const seconds = secondsCounter

    const formattedHours = hours.toString().padStart(2, '0')
    const formattedMinutes = minutes.toString().padStart(2, '0')
    const formattedSeconds = seconds.toString().padStart(2, '0')

    return {
      h: formattedHours,
      m: formattedMinutes,
      s: formattedSeconds
    }
  }, [minutesFocusedToday, secondsCounter])

  return (
    <div className='relative size-full'>
      <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <div className='size-64 flex justify-center items-center relative'>
          <span
            className={`text-white/90 text-9xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [&>span]:${FONTS.AZERET_MONO}`}
            style={{ textShadow: '0px 0px 0.25rem rgba(255, 255, 255, 0.5)' }}
          >
            <span>{displayTimer.h}</span>:<span>{displayTimer.m}</span>:<span>{displayTimer.s}</span>
          </span>

          <div
            className={`
              absolute left-0 top-0 w-full aspect-square rounded-full 
              shadow-circle shadow-blue-10/10 animate-pulse
            `}
          />
        </div>
      </span>
    </div>
  )
}
