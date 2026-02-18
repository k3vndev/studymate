import { useUserStudyplan } from '@/hooks/useUserStudyplan'
import { StudyplanContext } from '@/lib/context/StudyplanContext'
import { Badge } from '@@/Badge'
import { ChipButton } from '@@/ChipButton'
import { Paragraph } from '@@/Paragraph'
import { CheckIcon, RocketIcon } from '@icons'
import { useRouter } from 'next/navigation'
import { useContext } from 'react'

// Note: This component should only be used for userStudyplan, not for public studyplans
export const TodaysLesson = () => {
  const { currentDay, userStudyplan, areTodaysTasksAllDone } = useUserStudyplan()
  const router = useRouter()

  if (!userStudyplan || !currentDay) return null

  const { name, desc, tasks } = userStudyplan.daily_lessons[currentDay - 1]

  const handleClick = () => {
    router.push('/studyplan/tasks')
  }

  return (
    <section
      className='flex w-full h-fit flex-col bg-card-background px-7 py-6 rounded-2xl z-10 border border-card-border card animate-fade-in-fast'
      onClick={handleClick}
    >
      <div className='flex w-full justify-between items-center'>
        <Badge className='mb-3'>TODAY'S LESSON</Badge>
        {areTodaysTasksAllDone && <CheckIcon className='text-blue-20 size-7 scale-150 origin-right' />}
      </div>

      <div className='flex flex-col gap-1'>
        <Paragraph size={3} className='font-medium text-white'>
          {name}:
        </Paragraph>
        <Paragraph>{desc}</Paragraph>
      </div>

      <div className='flex justify-between items-center mt-6 gap-x-4 gap-y-3 flex-wrap'>
        <span className='text-white text-nowrap'>Day {currentDay}</span>
        <ChipButton onClick={handleClick}>
          <RocketIcon />
          See today's tasks
        </ChipButton>
      </div>
    </section>
  )
}
