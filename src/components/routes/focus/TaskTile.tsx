import { CheckIcon } from '@icons'
import { twMerge } from 'tailwind-merge'

interface Props {
  className?: string
  done: boolean
  goal: string
}

export const TaskTile = ({ done, goal, className = '' }: Props) => {
  const textStyle = done ? 'line-through italic text-white/75' : 'text-white'
  const bgStyle = done ? 'bg-gray-50' : 'bg-gray-60'

  return (
    <li
      className={twMerge(`
        px-4 min-h-full max-h-full w-full flex md:gap-5 gap-2 items-center 
        shadow-card shadow-black/20 justify-between ${bgStyle} ${className}
      `)}
    >
      <span className={`${textStyle} text-pretty w-full`}>{goal}</span>

      <span className='h-full flex items-center justify-end'>
        {done && <CheckIcon className='text-blue-20 size-12 stroke-[2.5px]' />}
      </span>
    </li>
  )
}
