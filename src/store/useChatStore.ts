import { parseChatMessages } from '@/lib/utils/parseChatMessages'
import { type ValueOrCallback, setState } from '@/lib/utils/setState'
import type { ChatMessage, ChatStudyplan } from '@types'
import { create } from 'zustand'

interface ChatsStore {
  messages: ChatMessage[] | null
  setMessages: (chatMessages: ValueOrCallback<ChatsStore['messages']>) => void
  pushMessages: (...chatMessages: ChatMessage[]) => void

  userInput: string
  setUserInput: (value: ValueOrCallback<string>) => void

  highlightedMessage: string | null
  setHighlihtedMessage: (value: ValueOrCallback<ChatsStore['highlightedMessage']>) => void

  setStudyplanOriginalId: (
    messageId: string,
    newOriginalId: string,
    callback?: (newMessages: ChatMessage[]) => void
  ) => void
}

export const useChatStore = create<ChatsStore>(set => ({
  messages: null,
  setMessages: state =>
    set(s =>
      setState(s, 'messages', state, value => {
        const messages = value ? parseChatMessages(value) : null
        return messages
      })
    ),

  pushMessages: (...newMessages) =>
    set(({ messages }) => {
      const prevMessages = messages ?? []
      const parsedNewMessages = parseChatMessages(newMessages)
      return { messages: [...prevMessages, ...parsedNewMessages] }
    }),

  userInput: '',
  setUserInput: state => set(s => setState(s, 'userInput', state, value => value)),

  highlightedMessage: null,
  setHighlihtedMessage: state => set(s => setState(s, 'highlightedMessage', state, value => value)),

  setStudyplanOriginalId: (chatMessageId, newOriginalId, callback = () => {}) =>
    set(({ messages }) => {
      if (messages === null) return {}

      const index = messages.findIndex(
        ({ role, content }) => role === 'studyplan' && content.chat_message_id === chatMessageId
      )
      if (index === -1) return {}

      const newMessages = structuredClone(messages)
      const newChatStudyplan = newMessages[index]
      ;(newChatStudyplan.content as ChatStudyplan).original_id = newOriginalId

      newMessages.splice(index, 1, newChatStudyplan)

      if (callback) {
        callback(newMessages)
      }

      return { messages: newMessages }
    })
}))
