import { MATE_TRAIN_MESSAGE } from '@/app/api/utils/ai-model/mateTrainMessage'
import { MateResponseSchema } from '@/lib/schemas/MateResponse'
import { MATE_MESSAGES_MEMORY } from '@consts'
import type { PromptRequestSchema as PromptRequestSchemaType } from '@types'
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod.mjs'
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

interface Data {
  userData?: PromptRequestSchemaType['user_data']
  prevMessages: ChatCompletionMessageParam[]
}

export const promptAIModel = async (
  { userData, prevMessages }: Data,
  ...newMessages: ChatCompletionMessageParam[]
) => {
  const openai = new OpenAI()
  openai.apiKey = process.env.OPENAI_API_KEY ?? ''

  const previousMessages = prevMessages.slice(-MATE_MESSAGES_MEMORY)

  const trainingMessages: ChatCompletionMessageParam[] = [{ role: 'system', content: MATE_TRAIN_MESSAGE }]

  if (userData) {
    trainingMessages.push({ role: 'system', content: JSON.stringify({ user_data: userData }) })
  }

  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages: [
      ...trainingMessages,

      ...previousMessages,
      ...newMessages
    ],
    response_format: zodResponseFormat(MateResponseSchema, 'messages_and_studyplan')
  })

  const { parsed } = completion.choices[0].message
  if (parsed === null) throw new Error()

  return parsed.responses
}
