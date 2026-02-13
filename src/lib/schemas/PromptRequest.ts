import { MATE_PROMPT_VALUES, USER_MAX_MESSAGE_LENGTH } from '@/consts'
import { StudyplanSchema } from '@schemas/Studyplan'
import { z } from 'zod'

export const PromptRequestSchema = z.object({
  messages: z.array(
    z.union([
      z.object({
        role: z.literal('user'),
        content: z.string().trim().nonempty().max(USER_MAX_MESSAGE_LENGTH)
      }),
      z.object({
        role: z.literal('assistant'),
        content: z.string().trim().nonempty().max(MATE_PROMPT_VALUES.MESSAGE.MAX_INFORCED)
      }),
      z.object({
        role: z.enum(['studyplan']),
        content: StudyplanSchema.extend({
          original_id: z.string().uuid().nullable(),
          chat_message_id: z.string().nullable()
        })
      })
    ])
  ),
  user_data: z.object({
    current_studyplan: StudyplanSchema.extend({
      original_id: z.string(),
      current_day: z.number()
    }).nullable()
  })
})
