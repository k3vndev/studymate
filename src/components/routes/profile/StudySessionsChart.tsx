import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@@/ui/chart'
import { DateTime } from 'luxon'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

interface Props {
  data: Record<string, number | string>[]
}

export const StudySessionsChart = ({ data }: Props) => {
  if (!data) return null

  const blue20Color = '#6168E8'

  const chatConfig = {
    hours: {
      label: 'Hours',
      color: blue20Color
    }
  } satisfies ChartConfig

  const xAxisTickFormatter = (value: string) => {
    const date = DateTime.fromISO(value)
    return date.toFormat('MMM d')
  }

  const tooltipValueFormatter = (value: number | string) => {
    const numericValue = typeof value === 'number' ? value : Number(value)

    if (Number.isFinite(numericValue)) {
      return numericValue.toFixed(2)
    }
    return String(value)
  }

  return (
    <div className='w-full bg-black/25 border border-gray-30 rounded-xl p-5 pl-0'>
      <ChartContainer config={chatConfig} className='max-h-56 min-h-32 w-full'>
        <BarChart data={data}>
          <CartesianGrid vertical={false} className='opacity-15' />
          <Bar
            dataKey='hours'
            name='Hours'
            fill={blue20Color}
            minPointSize={value => ((value ?? 0) > 0 ? 4 : 0)}
            radius={[4, 4, 0, 0]}
          />
          <ChartTooltip
            cursor={{ fill: 'hsl(var(--muted))', fillOpacity: 0.05 }}
            content={
              <ChartTooltipContent
                className='bg-black/75 border-card-border backdrop-blur-md'
                formatter={(value, name) => (
                  <>
                    <div className='size-3 bg-blue-20 rounded-sm' />
                    <span className='text-gray-10/80'>{name}</span>
                    <span className='font-mono font-medium tabular-nums  text-gray-10'>
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
            tickMargin={12}
            minTickGap={32}
            tickFormatter={xAxisTickFormatter}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={16}
            dataKey='hours'
            tickFormatter={data => `${data}h`}
          />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
