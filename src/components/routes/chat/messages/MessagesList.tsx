import { CHAT_ERROR_MESSAGE } from '@consts'
import { ChatContext } from '@context/ChatContext'
import { useChatStore } from '@store/useChatStore'
import type { ChatMessage as ChatMessageType } from '@types'
import { useContext } from 'react'
import { ChatMessage } from './tiles/ChatMessage'

export const MessagesList = () => {
  const messages = useChatStore(s => s.messages) as ChatMessageType[]
  const { isWaitingResponse, isOnChatError, listRef, isStreamingResponse } = useContext(ChatContext)

  return (
    <ul
      className={`
        w-full max-h-full flex flex-col gap-4 pb-16 pt-32 
        overflow-hidden animate-fade-in-fast mb-12 min-h-0
      `}
      ref={listRef}
    >
      {messages.map((msg, i) => {
        const streaming = isStreamingResponse && msg.role === 'assistant' && i === messages.length - 1
        return <ChatMessage isStreaming={streaming} {...msg} key={i} />
      })}
      {isWaitingResponse && <ChatMessage role='bubbles' content='' />}
      {isOnChatError && <ChatMessage role='error' content={CHAT_ERROR_MESSAGE} />}
    </ul>
  )
}
