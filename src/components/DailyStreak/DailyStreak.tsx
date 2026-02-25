import { useResponsiveness } from '@hooks/useResponsiveness'
import type { WeeklyData } from '@types'
import { useRouter } from 'next/navigation'

interface Props {
  weeklyData: WeeklyData[] | null
}

export const DailyStreak = ({ weeklyData }: Props) => {
  const { media } = useResponsiveness()
  const router = useRouter()

  const handleClick = () => {
    router.push('/profile')
  }

  return (
    <div
      className='flex justify-between items-center md:px-8 px-2 pb-12 pt-4 flex-1 card'
      onClick={handleClick}
    >
      {weeklyData?.map(({ date, weekDay, focused }, index) => {
        const isLast = index === weeklyData.length - 1

        const mainColor = focused ? 'bg-blue-20' : 'bg-gray-30'
        const rightLineColor =
          !isLast && focused && weeklyData[index + 1].focused ? 'bg-blue-20' : 'bg-gray-30'

        const isMobile = !media.md
        const weekDayShort = isMobile ? weekDay[0] : weekDay.slice(0, 3)
        const displayText = isLast ? 'Today' : weekDayShort

        return (
          <>
            <div
              className={`md:size-6 size-4 scale-150 relative rounded-full shadow-card shadow-black/25 z-10 ${mainColor}`}
              key={date}
            >
              <span className='absolute md:-bottom-6 -bottom-5 text-xs font-medium text-gray-10 left-1/2 -translate-x-1/2'>
                {displayText}
              </span>
            </div>
            {!isLast && <div className={`flex-1 md:h-3 h-2 ${rightLineColor}`} />}
          </>
        )
      })}
    </div>
  )
}
