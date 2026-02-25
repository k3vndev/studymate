import { FONTS } from '@/consts'
import { useUserStatistics } from '@hooks/useUserStatistics'
import { FireIcon, RocketIcon } from '@icons'
import { useUserStore } from '@store/useUserStore'
import type { WeeklyData } from '@types'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChipButton } from '../ChipButton'
import { FallbackBox } from '../FallbackBox'
import { DailyStreak } from './DailyStreak'

export const DailyStreakSection = () => {
  const hydrated = useUserStore(s => s.hydrated)
  const { getDailyFocusedHours } = useUserStatistics()

  const [weeklyData, setWeeklyData] = useState<WeeklyData[] | null>(null)
  const [streak, setStreak] = useState(0)

  const router = useRouter()

  useEffect(() => {
    const dailyFocusedHours = getDailyFocusedHours()
    if (!dailyFocusedHours) return

    const days = 7
    const weekly: WeeklyData[] = []
    let currentStreak = 0

    // Populate a set with the dates that have focused hours greater than 0 for quick lookup
    const dailyHoursSet = new Set<string>()
    for (const { date, hours } of dailyFocusedHours) {
      if (hours > 0) dailyHoursSet.add(date)
    }

    // Get reversed dates (so the most recent day is last) and format it to YYYY-MM-DD
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      const [formattedDate] = date.toISOString().split('T')

      const focused = dailyHoursSet.has(formattedDate)

      weekly.push({
        date: formattedDate,
        weekDay: date.toLocaleDateString('en-US', { weekday: 'long' }),
        focused
      })

      if (focused) {
        currentStreak++
      } else {
        currentStreak = 0
      }
    }

    setWeeklyData(weekly)
    setStreak(currentStreak)
  }, [hydrated])

  const handleClick = () => {
    router.push('/focus')
  }

  const displayText =
    streak > 0
      ? [`${streak}-day streak!`, 'Keep it up!']
      : ['No streak yet', 'Start focusing to build your streak!']

  const streakIconColor = streak > 0 ? 'text-blue-20' : 'text-gray-10'

  return (
    <section className='flex flex-col justify-center gap-4 w-full'>
      {weeklyData ? <DailyStreak weeklyData={weeklyData} /> : <FallbackBox className='w-full h-24' />}

      <div className='flex justify-between items-center flex-wrap gap-4'>
        {weeklyData ? (
          <div className={`${FONTS.POPPINS} text-nowrap`}>
            <h3 className='text-2xl font-semibold flex items-center gap-1'>
              <FireIcon className={`size-8 ${streakIconColor}`} />
              <span>{displayText[0]}</span>
            </h3>
            <span className='text-lg text-gray-10'>{displayText[1]}</span>
          </div>
        ) : (
          <FallbackBox className='w-48 h-12 bg-zinc-700' />
        )}

        <ChipButton className='animate-fade-in-fast' onClick={handleClick} empty>
          <RocketIcon />
          Let's focus!
        </ChipButton>
      </div>
    </section>
  )
}
