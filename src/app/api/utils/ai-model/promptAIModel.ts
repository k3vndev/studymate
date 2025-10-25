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

  const systemMessages: ChatCompletionMessageParam[] = [{ role: 'system', content: MATE_TRAIN_MESSAGE }]

  if (userData) {
    systemMessages.push({ role: 'system', content: JSON.stringify({ user_data: userData }) })
  }

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [...systemMessages, ...newMessages],
    stream: true
  })

  return stream
}
