import { useResponsiveness } from '@/hooks/useResponsiveness'
import { useUserPrompts } from '@/hooks/useUserPrompts'
import { CardMate } from '@@/CardMate'
import { ChipButton } from '@@/ChipButton'
import { Header } from '@@/Header'
import { Paragraph } from '@@/Paragraph'
import { MATE_MESSAGES, SCREENS } from '@consts'
import { CheckListIcon, MagicWandIcon, MessageIcon } from '@icons'
import type { UserStudyplan } from '@types'
import { TaskTile } from './TaskTile'

type Props = UserStudyplan['daily_lessons'][number]

export const TodaysTasks = ({ desc, tasks }: Props) => {
  const prompts = useUserPrompts({ redirect: true })
  const allTasksAreDone = tasks.every(t => t.completed_at)
  const { screenSize } = useResponsiveness()

  const mateMessage = allTasksAreDone ? MATE_MESSAGES.TASKS.DONE : MATE_MESSAGES.TASKS.NOT_DONE
  const showChatButton = screenSize.x >= SCREENS.MD

  return (
    <>
      <div className='flex flex-col gap-4 animate-fade-in-fast'>
        <Header size={3}>
          Today's tasks
          <CheckListIcon className='size-8' />
        </Header>

        <Paragraph>{desc}</Paragraph>
      </div>

      <CardMate message={mateMessage} className={{ main: 'animate-fade-in-fast' }}>
        {allTasksAreDone ? (
          <ChipButton empty onClick={prompts.whatsNext}>
            <MagicWandIcon /> What's next?
          </ChipButton>
        ) : (
          <ChipButton empty onClick={prompts.explainTasks}>
            <MagicWandIcon /> Explain tasks
          </ChipButton>
        )}

        {showChatButton && (
          <ChipButton onClick={prompts.blank}>
            <MessageIcon /> Chat
          </ChipButton>
        )}
      </CardMate>

      <section className='flex flex-col gap-3 animate-fade-in-fast'>
        {tasks.map(({ goal, completed_at }, i) => (
          <TaskTile {...{ goal, done: !!completed_at, index: i }} key={i} />
        ))}
      </section>
    </>
  )
}
