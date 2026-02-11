import { dispatchEvent } from '@/lib/utils/dispatchEvent'
import { EVENTS, FONTS } from '@consts'
import { ErrorIcon, ReloadIcon } from '@icons'

export const ChatError = ({ children }: { children: React.ReactNode }) => {
  const handleClick = () => {
    dispatchEvent(EVENTS.ON_CHAT_TRY_AGAIN)
  }

  return (
    <li
      className={`
        ${FONTS.INTER} error rounded-md py-5 px-7 group
         w-fit flex gap-4 items-center justify-center relative button cursor-pointer
      `}
      onClick={handleClick}
    >
      <ErrorIcon className='size-8' />
      <div className='flex flex-col'>
        <span className='font-medium'>{children}</span>
        <span className='text-sm opacity-75'>Click to try again</span>
      </div>

      <ReloadIcon className='absolute size-8 -right-12 group-hover:rotate-180 group-hover:scale-110 [transition:transform_.33s_ease-out]' />
    </li>
  )
}
