import type { ChatMessage, ChatStudyplan, DBChatMessages, PromptRequestSchema } from '@types'
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { modelTags } from './ai-model/modelTags'

export const dataParser = {
  fromStudyplanToModelPrompt: (studyplan: ChatStudyplan): string => {
    const { name, category, desc, daily_lessons } = studyplan

    const dailyLessons: string[] = []
    let currentDay = 0

    for (const { name, desc, tasks } of daily_lessons) {
      const dailyLessonArr = [
        `### ${++currentDay}`,
        `name: ${name}`,
        `desc: ${desc}`,
        'tasks:',
        tasks.map(desc => `- ${desc}`).join('\n')
      ]
      dailyLessons.push(dailyLessonArr.join('\n'))
    }

    const baseDataStr = [
      `name: ${name}`,
      `desc: ${desc}`,
      `category: ${category}`,
      'daily_lessons:',
      dailyLessons.join('\n')
    ]

    return [modelTags.open('STUDYPLAN'), baseDataStr.join('\n'), modelTags.close('STUDYPLAN')].join('\n')
  },

  fromClientMessagesToModelPrompt: (
    messages: PromptRequestSchema['messages']
  ): ChatCompletionMessageParam[] =>
    messages.map(({ role, content }) => {
      if (role === 'studyplan') {
        // Parse Studyplan object to the format the model understands and generates
        const parsedStudyplan = dataParser.fromStudyplanToModelPrompt(content)
        return { role: 'assistant', content: parsedStudyplan }
      }
      return { role, content }
    }),

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
