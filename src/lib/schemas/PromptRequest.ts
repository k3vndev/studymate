import { StudyplanSchema } from '@schemas/Studyplan'
import { z } from 'zod'

export const PromptRequestSchema = z.object({
  messages: z.array(
    z.union([
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().nonempty()
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
