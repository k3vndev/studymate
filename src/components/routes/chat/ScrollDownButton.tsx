import { EVENTS } from '@consts'
import { ChatContext } from '@context/ChatContext'
import { ArrowIcon } from '@icons'
import { dispatchEvent } from '@utils/dispatchEvent'
import { useContext } from 'react'

export const ScrollDownButton = () => {
  const { scrollIsOnBottom, inputElementHeight } = useContext(ChatContext)

  const handleClick = () => {
    dispatchEvent(EVENTS.ON_CHAT_SCROLL_DOWN)
  }

  const isVisible = !scrollIsOnBottom
  const style = isVisible
    ? 'opacity-100 scale-100 pointer-events-auto'
    : 'opacity-0 scale-75 pointer-events-none'

  return (
    <button
      className={`
        transition-all duration-200 absolute left-1/2 -translate-x-1/2 rounded-full 
        border border-gray-20 p-3 bg-gray-60 button ${style}
      `}
      style={{ bottom: `calc(3rem + ${inputElementHeight}px)` }}
      onClick={handleClick}
    >
      <ArrowIcon className='text-gray-20 size-7' />
    </button>
  )
}
