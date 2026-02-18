import { useResponsiveness } from '@/hooks/useResponsiveness'
import { TasksContext } from '@/lib/context/TasksContext'
import { getOrdinal } from '@/lib/utils/getOrdinal'
import { ChipButton } from '@components/ChipButton'
import { SCREENS } from '@consts'
import { useJustLoaded } from '@hooks/useJustLoaded'
import { useUserPrompts } from '@hooks/useUserPrompts'
import { ArrowIcon, CheckIcon, MagicWandIcon, RocketIcon } from '@icons'
import { useRouter } from 'next/navigation'
import { useContext } from 'react'

export const Buttons = () => {
  const { selectedTaskIsDone } = useContext(TasksContext)

  return (
    <div className='flex gap-2 self-end'>
      {selectedTaskIsDone ? (
        <ProceedButton />
      ) : (
        <>
          <ExplainTaskButton />
          <CompleteTaskButton />
        </>
      )}
    </div>
  )
}

const ExplainTaskButton = () => {
  const { selectedTask } = useContext(TasksContext)
  const prompts = useUserPrompts({ redirect: true })
  const { isLoading } = useContext(TasksContext)

  const { screenSize } = useResponsiveness()
  const buttonLabel = screenSize.x >= SCREENS.XS ? 'Explain this task' : 'Explain'

  const prompt = () => {
    // Get the ordinal number
    const ordinals = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh']
    const ordinal = selectedTask < ordinals.length ? ordinals[selectedTask] : getOrdinal(selectedTask + 1)

    // Send prompt
    const message = `Hey Mate, would you help me with my ${ordinal} task of today?`
    prompts.custom(message)
  }

  return (
    <ChipButton empty disabled={isLoading} onClick={prompt}>
      <MagicWandIcon /> {buttonLabel}
    </ChipButton>
  )
}

const ProceedButton = () => {
  const { tasks, allTasksAreDone, swapTask, isOnLastDay } = useContext(TasksContext)
  const router = useRouter()

  const handleFinishDay = () => {
    if (isOnLastDay) {
      router.replace('/studyplan')
      return
    }
    router.replace('/studyplan/tasks')
  }

  const handleNextTask = () => {
    const nextNotDoneTaskIndex = tasks.findIndex(t => !t.completed_at)
    if (nextNotDoneTaskIndex === -1) return

    swapTask(nextNotDoneTaskIndex)
  }

  if (allTasksAreDone) {
    return (
      <ChipButton onClick={handleFinishDay}>
        <RocketIcon /> Finish this day
      </ChipButton>
    )
  }

  return (
    <ChipButton onClick={handleNextTask}>
      <ArrowIcon className='[rotate:-90deg] animate-bounce' /> Next task
    </ChipButton>
  )
}

const CompleteTaskButton = () => {
  const { selectedTask, completeTask, isLoading } = useContext(TasksContext)
  const justLoaded = useJustLoaded(400, [selectedTask])

  const { screenSize } = useResponsiveness()
  const buttonLabel = screenSize.x >= SCREENS.XS ? "I'm done" : 'Done'

  return (
    <ChipButton
      className='[&>svg]:stroke-[3px]'
      onClick={completeTask}
      disabled={justLoaded || isLoading}
      isLoading={isLoading}
    >
      {<CheckIcon />}
      <span className='w-full'>{buttonLabel}</span>
    </ChipButton>
  )
}
