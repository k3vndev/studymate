import { useUserPrompts } from '@/hooks/useUserPrompts'
import { useUserStore } from '@store/useUserStore'
import type { UserStudyplan } from '@types'
import { useRouter } from 'next/navigation'
import { ChipButton } from '../ChipButton'
import { FallbackBox } from '../FallbackBox'
import { Header } from '../Header'
import { CheckIcon, MagicWandIcon, RocketIcon } from '../icons'

interface Props {
  tasks: UserStudyplan['daily_lessons'][number]['tasks']
  isLoading: boolean
}

export const TodaysTasksSection = ({ tasks, isLoading }: Props) => {
  const router = useRouter()
  const prompts = useUserPrompts()

  if (isLoading) {
    return <FallbackBox className='w-full h-48' />
  }

  if (!tasks.length) return null

  const navigateToTasks = () => {
    router.push('/studyplan/tasks')
  }

  return (
    <section className='flex flex-col gap-4'>
      <Header>Today's tasks</Header>

      <div
        className='bg-card-background border border-card-border rounded-2xl px-5 py-4 w-full relative card'
        onClick={navigateToTasks}
      >
        <ul className='flex flex-col gap-2 max-h-40 overflow-clip'>
          {[...tasks, ...tasks].map((task, i) => {
            const done = !!task.completed_at
            const style = done ? 'line-through bg-gray-60' : 'bg-gray-50'

            return (
              <li
                className={`list-none flex justify-between items-center px-6 py-5 rounded-xl ${style}`}
                key={i}
              >
                <span className='text-gray-10'>{task.goal}</span>
                {done && <CheckIcon className='text-blue-20 size-8 scale-150' />}
              </li>
            )
          })}
        </ul>

        <div className='absolute size-full top-0 left-0 bg-gradient-to-t from-card-background via-card-background/75 rounded-2xl flex items-end justify-end p-5 gap-2'>
          <ChipButton empty onClick={prompts.explainTasks}>
            <MagicWandIcon />
            Explain
          </ChipButton>
          <ChipButton onClick={navigateToTasks}>
            <RocketIcon />
            See All
          </ChipButton>
        </div>
      </div>
    </section>
  )
}
