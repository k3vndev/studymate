import type { ChatMessage } from '@types'

export const parseChatMessages = (chatMessages: ChatMessage[]): ChatMessage[] =>
  chatMessages.map(({ role, content }, index) => {
    if (role === 'studyplan') {
      // Creates a session identifier based on index
      const chat_message_id = `chat-${index.toString().padStart(5, '0')}`
      return { content: { ...content, chat_message_id }, role }
    }
    return { role, content } as ChatMessage
  })
