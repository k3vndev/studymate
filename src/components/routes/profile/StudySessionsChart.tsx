import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@@/ui/chart'
import { useUserStatistics } from '@hooks/useUserStatistics'
import { useUserStore } from '@store/useUserStore'
import { DateTime } from 'luxon'
import { useMemo } from 'react'
import { Bar, BarChart, XAxis } from 'recharts'

export const StudySessionsChart = () => {
  const { getDailyFocusedHours } = useUserStatistics()
  const studySessions = useUserStore(s => s.studySessions)

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

  const data = useMemo(() => retrieveRecentDailyData(8), [studySessions])

  if (!data) return null

  const blue20Color = '#6168E8'

  const chatConfig = {
    hours: {
      label: 'Hours',
      color: blue20Color
    }
  } satisfies ChartConfig

  const xAxisTickFormatter = (value: string) => {
    const date = new Date(value)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const tooltipValueFormatter = (value: number | string) => {
    const numericValue = typeof value === 'number' ? value : Number(value)

    if (Number.isFinite(numericValue)) {
      return numericValue.toFixed(2)
    }

    return String(value)
  }

  return (
    <div className='w-full bg-gray-60 border border-gray-30 rounded-xl'>
      <ChartContainer config={chatConfig} className='h-48 w-full'>
        <BarChart data={data}>
          <Bar
            dataKey='hours'
            name='Hours'
            fill={blue20Color}
            minPointSize={(value: number | null | undefined) => ((value ?? 0) > 0 ? 4 : 0)}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <>
                    <span className='text-muted-foreground'>{name}</span>
                    <span className='font-mono font-medium tabular-nums text-foreground'>
                      {tooltipValueFormatter(value as number | string)}
                    </span>
                  </>
                )}
              />
            }
          />
          <XAxis
            dataKey='date'
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={xAxisTickFormatter}
          />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
