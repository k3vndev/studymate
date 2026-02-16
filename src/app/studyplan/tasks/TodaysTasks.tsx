import { CardMate } from '@/components/CardMate'
import { ChipButton } from '@/components/ChipButton'
import { Header } from '@/components/Header'
import { Paragraph } from '@/components/Paragraph'
import { useResponsiveness } from '@/hooks/useResponsiveness'
import { useUserPrompts } from '@/hooks/useUserPrompts'
import { MATE_MESSAGES, SCREENS } from '@consts'
import { CheckListIcon, MagicWandIcon, MessageIcon } from '@icons'
import type { UserStudyplan } from '@types'
import { TaskTile } from './TaskTile'

type Props = UserStudyplan['daily_lessons'][number]

export const TodaysTasks = ({ desc, tasks }: Props) => {
  const prompts = useUserPrompts({ redirect: true })
  const allTasksAreDone = tasks.every(t => t.done)
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
        {tasks.map(({ goal, done }, i) => (
          <TaskTile {...{ goal, done, index: i }} key={i} />
        ))}
      </section>
    </>
  )
}
