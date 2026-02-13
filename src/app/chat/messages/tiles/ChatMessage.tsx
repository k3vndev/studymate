import type { ChatMessage as ChatMessageType, ChatStudyplan } from '@types'
import { ChatBubbles } from './ChatBubbles'
import { ChatError } from './ChatError'
import { GeneratingStudyplanLoader } from './GeneratingStudyplanLoader'
import { OverlayBase } from './OverlayBase'
import { StudyplanMessage } from './StudyplanMessage'

interface Props {
  role: ChatMessageType['role'] | 'bubbles'
  content: ChatMessageType['content']
  isStreaming?: boolean
}

export const ChatMessage = ({ role, content, isStreaming = false }: Props) => {
  if (typeof content !== 'string') {
    if (role === 'generating_studyplan') {
      return <GeneratingStudyplanLoader content={content} />
    }
    if (role === 'studyplan') {
      return <StudyplanMessage studyplan={content as ChatStudyplan} />
    }

    return null
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

interface ChildrenProps {
  children: React.ReactNode
}

const UserOverlay = ({ children }: ChildrenProps) => (
  <OverlayBase
    className={`
      from-blue-30 to-blue-20 text-white rounded-se-[3px] self-end 
      md:max-w-96 xs:max-w-64 max-w-56
    `}
  >
    {children}
  </OverlayBase>
)

const AssistantOverlay = ({ children, isStreaming }: ChildrenProps & { isStreaming?: boolean }) => (
  <OverlayBase
    supportCodeSnippets
    className={`
      from-gray-30/5 to-gray-30/25 text-white/90 rounded-ss-[3px] self-start
      xs:max-w-[calc(100%-10rem)] max-w-[calc(100%-4rem)]
      ${isStreaming ? 'assistant-message-streaming' : ''}
    `}
  >
    {children}
  </OverlayBase>
)
