import { dispatchEvent } from '@/lib/utils/dispatchEvent'
import { repeat } from '@/lib/utils/repeat'
import { useUserStore } from '@/store/useUserStore'
import { CardStudyplan } from '@components/CardStudyplan'
import { EVENTS, FONTS } from '@consts'
import { ErrorIcon, ReloadIcon } from '@icons'
import type { ChatMessage as ChatMessageType, ChatStudyplan } from '@types'
import { twMerge } from 'tailwind-merge'

interface Props {
  role: ChatMessageType['role'] | 'bubbles'
  content: ChatMessageType['content']
  isStreaming?: boolean
}

export const ChatMessage = ({ role, content, isStreaming = false }: Props) => {
  if (typeof content !== 'string') {
    return <StudyplanMessage studyplan={content} />
  }

  if (role === 'user') {
    return <UserOverlay>{content}</UserOverlay>
  }
  if (role === 'assistant') {
    return <AssistantOverlay isStreaming={isStreaming}>{content}</AssistantOverlay>
  }
  if (role === 'bubbles')
    return (
      <AssistantOverlay>
        <ChatBubbles />
      </AssistantOverlay>
    )

  return <ChatError>{content}</ChatError>
}

export const ChatBubbles = () => (
  <div className='flex gap-2 items-center justify-center h-7 w-12'>
    {repeat(3, i => (
      <div
        className='size-[0.625rem] bg-gray-10 rounded-full'
        style={{
          animation: `chat-message-bubbles-pounce 0.4s ease ${i * 0.2}s both infinite alternate`
        }}
        key={i}
      />
    ))}
  </div>
)

interface ChildrenProps {
  children: React.ReactNode
}

export const ChatError = ({ children }: ChildrenProps) => {
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

const UserOverlay = ({ children }: ChildrenProps) => (
  <OverlayBase
    className={`
      from-blue-30 to-blue-20 text-white rounded-se-none self-end 
      md:max-w-96 xs:max-w-64 max-w-56
    `}
  >
    {children}
  </OverlayBase>
)
const AssistantOverlay = ({ children, isStreaming }: ChildrenProps & { isStreaming?: boolean }) => (
  <OverlayBase
    className={`
      from-gray-30/5 to-gray-30/25 text-gray-10 rounded-ss-none self-start
      xs:max-w-[calc(100%-10rem)] max-w-[calc(100%-4rem)]
      ${isStreaming ? 'after:size-3 after:[content:""] after:bg-white after:inline-block after:ml-1.5 after:rounded-sm after:animate-pulse after:rotate-45' : ''}
    `}
  >
    {children}
  </OverlayBase>
)

interface OverlayBaseProps {
  className?: string
  children?: React.ReactNode
}

const OverlayBase = ({ className = '', children }: OverlayBaseProps) => (
  <li
    className={twMerge(`
      bg-gradient-to-br from-[-200%] px-6 list-none py-3 text-pretty
      rounded-3xl font-light w-fit ${FONTS.INTER} ${className}
    `)}
  >
    {children}
  </li>
)

interface StudyplanMessageProps {
  studyplan: ChatStudyplan
}

const StudyplanMessage = ({ studyplan }: StudyplanMessageProps) => {
  const userStudyplan = useUserStore(s => s.studyplan)

  const isUsersCurrent = () => {
    if (!userStudyplan?.original_id || !studyplan.original_id) return false
    return studyplan.original_id === userStudyplan.original_id
  }

  return (
    <CardStudyplan
      className='md:max-w-[22rem] max-w-[20rem] w-full'
      studyplan={studyplan}
      userCurrent={isUsersCurrent()}
      inChat
    />
  )
}
