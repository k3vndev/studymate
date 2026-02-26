import { Header } from '@@/Header'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@@/ui/select'
import { useUserStatistics } from '@hooks/useUserStatistics'
import { useUserStore } from '@store/useUserStore'
import { DateTime } from 'luxon'
import { useMemo, useState } from 'react'
import { StudySessionsChart } from './StudySessionsChart'

export const StudySessionsSection = () => {
  const { getDailyFocusedHours } = useUserStatistics()
  const studySessions = useUserStore(s => s.studySessions)

  const INITIAL_DAY_SPAN = 7
  const [daySpan, setDaySpan] = useState(INITIAL_DAY_SPAN)

  const retrieveRecentDailyData = (daySpan: number) => {
    const dailyHours = getDailyFocusedHours()
    if (!dailyHours || daySpan <= 0) return null

    // Transform daily hours to a Record for easier access
    const dailyHoursMap: Record<string, number> = Object.fromEntries(dailyHours.map(d => [d.date, d.hours]))

    // Record the last daySpan days
    const lastDays: { date: string; hours: number }[] = []
    for (let i = daySpan - 1; i >= 0; i--) {
      const date = DateTime.now()
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
        .minus({ days: i })
        .toISODate()!

      const hours = dailyHoursMap[date] || 0
      lastDays.push({ date, hours })
    }

    return lastDays
  }

  const data = useMemo(() => retrieveRecentDailyData(daySpan), [studySessions, daySpan])

  const selectItems = [
    { value: 7, label: 'Last 7 days' },
    { value: 15, label: 'Last 15 days' },
    { value: 30, label: 'Last 30 days' }
  ]

  const handleValueChange = (value: string) => {
    setDaySpan(+value)
  }

  return (
    <section className='flex flex-col gap-5 relative'>
      <div className='flex items-center justify-between gap-x-8 gap-y-3 flex-wrap'>
        <Header className='text-nowrap'>Your daily focusing time</Header>

        <Select defaultValue={String(INITIAL_DAY_SPAN)} onValueChange={handleValueChange}>
          <SelectTrigger className='w-48 bg-gray-40 border-gray-30'>
            <SelectValue placeholder='Select time span' defaultValue={String(INITIAL_DAY_SPAN)} />
          </SelectTrigger>
          <SelectContent
            position={'item-aligned'}
            className='bg-black/50 backdrop-blur-lg text-white border-gray-30'
          >
            <SelectGroup>
              <SelectLabel className='text-white/50'>Choose time span</SelectLabel>
              {selectItems.map(({ label, value }) => (
                <SelectItem key={value} value={String(value)}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {data && <StudySessionsChart data={data} />}
    </section>
  )
}
