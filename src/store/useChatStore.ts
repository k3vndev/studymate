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
  messages: [
    // Mock conversation
    {
      role: 'assistant',
      content: 'Hello! I am your study assistant. How can I help you today?'
    },
    {
      role: 'user',
      content:
        'Hi! Can you help me create a study plan for the next month? I want to learn more about machine learning and data science.'
    },
    {
      role: 'assistant',
      content:
        'Of course! I can help you create a personalized study plan for machine learning and data science. To get started, could you please tell me a bit more about your current knowledge level in these subjects and how much time you can dedicate to studying each week?'
    },
    {
      role: 'user',
      content:
        "I'm a beginner in both machine learning and data science, but I'm eager to learn. I can dedicate around 10 hours per week to studying."
    },
    {
      role: 'assistant',
      content:
        'Great! Based on your current knowledge level and the time you can dedicate, I would recommend the following study plan for the next month:'
    }
  ],
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
