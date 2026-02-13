import { Badge } from '@/components/Badge'
import { ChipButton } from '@/components/ChipButton'
import { Paragraph } from '@/components/Paragraph'
import { StudyplanContext } from '@/lib/context/StudyplanContext'
import { CheckIcon, RocketIcon } from '@icons'
import { useRouter } from 'next/navigation'
import { useContext } from 'react'

interface Props {
  day: number
}

export const TodaysLesson = ({ day }: Props) => {
  const { studyplan } = useContext(StudyplanContext)
  const router = useRouter()

  const { name, desc, tasks } = studyplan.daily_lessons[day - 1]
  const allTasksAreDone = tasks.every(task => task.done)

  const handleClick = () => {
    router.push('/studyplan/tasks')
  }

  return (
    <section
      className='flex w-full h-fit flex-col bg-card-background px-7 py-6 rounded-2xl border border-card-border card animate-fade-in-fast'
      onClick={handleClick}
    >
      <div className='flex w-full justify-between items-center'>
        <Badge className='mb-3'>TODAY'S LESSON</Badge>
        {allTasksAreDone && <CheckIcon className='text-blue-20 size-7 scale-150 origin-right' />}
      </div>

      <div className='flex flex-col gap-1'>
        <Paragraph size={3} className='font-medium text-white'>
          {name}:
        </Paragraph>
        <Paragraph>{desc}</Paragraph>
      </div>

      <div className='flex justify-between items-center mt-6 gap-x-4 gap-y-3 flex-wrap'>
        <span className='text-white text-nowrap'>Day {day}</span>
        <ChipButton onClick={handleClick}>
          <RocketIcon />
          See today's tasks
        </ChipButton>
      </div>
    </section>
  )
}
