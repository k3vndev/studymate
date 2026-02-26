import { ChipButton } from '@@/ChipButton'
import { FONTS } from '@consts'
import { CheckIcon, RocketIcon } from '@icons'
import { useRouter } from 'next/navigation'

type Props = {
  index: number
  goal: string
  done: boolean
}

export const TaskTile = ({ goal, done, index }: Props) => {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/focus?task=${index + 1}`)
  }

  const [text, background] = done
    ? ['line-through text-gray-10', 'bg-gray-50/50']
    : ['text-white', 'bg-gray-40/75']

  return (
    <div
      className={`
        ${background} flex items-center justify-between w-full rounded-lg shadow-card-shape shadow-black/15 card
        gap-4 md:px-8 sm:px-6 px-4 min-h-20 sm:py-3 py-4
      `}
      onClick={handleClick}
    >
      <span className={`${FONTS.INTER} ${text}`}>{goal}</span>

      {done ? (
        <CheckIcon className='size-[3.25rem] stroke-[2.5px] text-blue-20 text-pretty' />
      ) : (
        <ChipButton empty onClick={handleClick}>
          <RocketIcon /> Start
        </ChipButton>
      )}
    </div>
  )
}
