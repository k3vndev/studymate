import { useUserStudyplan } from '@/hooks/useUserStudyplan'
import { parseDays } from '@/lib/utils/parseDays'
import { useStudyplansStore } from '@/store/useStudyplansStore'
import { Badge } from '@@/Badge'
import { ChipButton } from '@@/ChipButton'
import { GradientBorder } from '@@/GradientBorder'
import { Header } from '@@/Header'
import { Paragraph } from '@@/Paragraph'
import { ClockIcon, RocketIcon } from '@icons'
import type { BaseStudyplan, ChatStudyplan, UserStudyplan } from '@types'
import { useRouter } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

interface Props {
  studyplan: BaseStudyplan | UserStudyplan | ChatStudyplan
  userCurrent?: boolean
  inChat?: boolean
  className?: string
}

export const CardStudyplan = ({ studyplan, userCurrent = false, inChat = false, className = '' }: Props) => {
  const setStudyplan = useStudyplansStore(s => s.setStudyplan)
  const userStudyplan = useUserStudyplan()

  const { name, desc, daily_lessons } = studyplan
  const router = useRouter()

  const handleClick = () => {
    setStudyplan(studyplan)

    if (inChat && !userCurrent && 'original_id' in studyplan && studyplan.original_id) {
      router.push(`/studyplan/${studyplan.original_id}`)
      return
    }
    router.push(userCurrent ? '/studyplan' : '/chat/studyplan')
  }

  const borderWidth = userCurrent ? 'p-0.5' : 'p-px'

  return (
    <GradientBorder
      className={{
        main: `w-fit ${borderWidth}`
      }}
      color='blues'
      constant={userCurrent}
    >
      <article
        className={twMerge(`
          w-[22rem] border border-card-border card bg-card-background 
          px-5 py-6 flex flex-col gap-1 rounded-2xl cursor-default ${className}
        `)}
        onClick={handleClick}
      >
        <Badge>STUDYPLAN</Badge>
        <Header className='mb-1'>{name}</Header>
        <Paragraph>{desc}</Paragraph>
        <div className='mt-3 flex justify-between items-center flex-wrap gap-x-4 gap-y-3 w-full'>
          <span className='flex text-gray-10 gap-1 items-center text-nowrap'>
            {userCurrent && userStudyplan ? (
              `Day ${userStudyplan.currentDay}`
            ) : (
              <>
                <ClockIcon className='size-6' />
                {parseDays(daily_lessons.length)}
              </>
            )}
          </span>
          <ChipButton onClick={handleClick} className='justify-self-end'>
            <RocketIcon />
            See plan
          </ChipButton>
        </div>
      </article>
    </GradientBorder>
  )
}
