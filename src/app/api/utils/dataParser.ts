import { MATE_PROMPT_VALUES } from '@consts'
import type {
  ChatMessage,
  ChatStudyplan,
  DBChatMessages,
  DBCurrentStudyplanDay,
  DBUserStudyplanAndCurrentDayResponse,
  MateResponseSchema,
  PromptRequestSchema
} from '@types'
import { modelTags } from './ai-model/modelTags'

export const dataParser = {
  fromDBResponseToUserStudyplan: (response: DBUserStudyplanAndCurrentDayResponse[]) => {
    const {
      studyplan: fetchedStudyplan,
      current_studyplan_day: { day }
    } = response[0]

    return { ...fetchedStudyplan, current_day: day }
  },

  fromModelResponseToClientMessages: (responses: MateResponseSchema['responses']): ChatMessage[] =>
    responses.map(({ type, data }) => {
      if (type === 'message') {
        return { role: 'assistant', content: data }
      }
      // Remove extra daily lessons and set the original_id to null
      const slicedDailyLessons = data.daily_lessons.slice(0, MATE_PROMPT_VALUES.STUDYPLAN.MAX_DAYS)
      const content: ChatStudyplan = {
        ...data,
        daily_lessons: slicedDailyLessons,
        original_id: null,
        chat_message_id: null
      }
      return { role: 'studyplan', content }
    }),

  fromClientMessagesToModelPrompt: (messages: PromptRequestSchema['messages']['previous']) =>
    messages.map(({ role, content }) => {
      if (role === 'assistant') {
        return { role, content: modelTags.wrap('TEXT', content) }
      }
      if (role === 'studyplan') {
        return {
          role: 'system',
          content: `Mate sent the following studyplan: " ${JSON.stringify(content)} "`
        }
      }
      return { role, content }
    }),

  fromNumberToCurrentStudyplanDay: (day: number): DBCurrentStudyplanDay => {
    const today = new Date()
    const last_updated = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`

    return { day, last_updated }
  },

  fromStudyplansInClientMessages: (messages: ChatMessage[] | DBChatMessages[]) => {
    const parse = (action: typeof JSON.parse | typeof JSON.stringify) =>
      messages.map(msg => {
        if (msg.role === 'studyplan') {
          return { ...msg, content: action(msg.content as any) }
        }
        return msg
      })
    return {
      toStringified: () => parse(JSON.stringify),
      toObject: () => parse(JSON.parse)
    }
  }
}
