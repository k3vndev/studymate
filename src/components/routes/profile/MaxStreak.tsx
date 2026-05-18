import { useUserStatistics } from '@/hooks/useUserStatistics'
import { FallbackBox } from '@@/FallbackBox'
import { Paragraph } from '@@/Paragraph'
import { FlameIcon } from '@icons'
import { useUserStore } from '@store/useUserStore'
import { DateTime } from 'luxon'
import { useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

export const MaxStreak = () => {
  const studySessions = useUserStore(s => s.studySessions)
  const { getDailyFocusedHours } = useUserStatistics()

  const maxStreakData = useMemo((): MaxStreakData | null => {
    const dailyFocusedHours = getDailyFocusedHours()
    if (!dailyFocusedHours) return null

    if (dailyFocusedHours.length === 0) {
      return {
        value: 0,
        isActiveMax: false,
        isActive: false
      }
    }

    let maxStreak = 0
    let currentStreak = 0

    let firstSessionDate: DateTime | null = null

    // Populate a set with dates for quick lookup and get first session date
    const sessionDatesSet = new Set<string>()
    for (const daily of dailyFocusedHours) {
      const dateISO = daily.date
      sessionDatesSet.add(dateISO)

      // Get the first session date to start the streak calculation
      const thisSessionDate = DateTime.fromISO(dateISO)
      if (!firstSessionDate || thisSessionDate < firstSessionDate) {
        firstSessionDate = thisSessionDate
      }
    }

    if (!firstSessionDate) return null // This should never happen since we check for length above, but just in case

    // Start from the first session date and check for consecutive days
    const differenceInDays = Math.ceil(DateTime.local().diff(firstSessionDate, 'days').days)

    for (let i = 0; i < differenceInDays; i++) {
      const dateToCheck = firstSessionDate.plus({ days: i }).toFormat('yyyy-MM-dd')

      if (sessionDatesSet.has(dateToCheck)) {
        currentStreak++

        if (currentStreak > maxStreak) {
          maxStreak = currentStreak
        }
      } else {
        currentStreak = 0
      }
    }

    const isCurrentlyInMaxStreak = currentStreak === maxStreak && currentStreak > 0

    return {
      value: maxStreak,
      isActiveMax: isCurrentlyInMaxStreak,
      isActive: currentStreak > 0
    }
  }, [studySessions])

  if (maxStreakData === null) {
    return <FallbackBox className='w-full max-w-72 h-12 mt-2' />
  }

  if (maxStreakData.value === 0) {
    return <StreakWrapper className='[&>svg]:text-gray-20'>Your max streak will appear here.</StreakWrapper>
  }

  if (maxStreakData.isActiveMax) {
    return (
      <StreakWrapper>You're on fire! Your {maxStreakData.value}-day streak is your record!</StreakWrapper>
    )
  }

  if (maxStreakData.isActive) {
    return <StreakWrapper>Max streak of {maxStreakData.value}! Keep it up!</StreakWrapper>
  }

  return (
    <StreakWrapper className='[&>svg]:text-gray-20'>
      Your max streak is {maxStreakData.value} days. Can you beat it?
    </StreakWrapper>
  )
}

interface StreakWrapperProps {
  className?: string
  children: React.ReactNode
}

const StreakWrapper = ({ className, children }: StreakWrapperProps) => (
  <Paragraph
    className={twMerge(
      `flex items-center gap-1 [&>svg]:min-w-8 [&>svg]:size-8 [&>svg]:text-blue-20 ${className}`
    )}
  >
    <FlameIcon />
    {children}
  </Paragraph>
)

interface MaxStreakData {
  value: number
  isActiveMax: boolean
  isActive: boolean
}
