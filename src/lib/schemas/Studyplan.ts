import { CATEGORIES, MATE_PROMPT_VALUES } from '@consts'
import { z } from 'zod'

const C = MATE_PROMPT_VALUES.STUDYPLAN

// -- Define unitlity schemas for later use --

const BasicDataSchema = z.object({
  name: z.string().min(C.NAME.MIN_ENFORCED).max(C.NAME.MAX_ENFORCED),
  desc: z.string().min(C.DESC.MIN_ENFORCED).max(C.DESC.MAX_ENFORCED),
  category: z.enum(CATEGORIES)
})

const createDailyLessonSchema = <T extends z.ZodTypeAny>({ task }: { task: T }) =>
  z.object({
    name: z.string(),
    desc: z.string(),
    tasks: z.array(task)
  })

// -- Define main schemas --

/**
 * Base Studyplan schema.
 * Like most Studyplans, its tasks are simple strings that simply represent its goals.
 */
export const BaseStudyplanSchema = BasicDataSchema.extend({
  daily_lessons: z.array(createDailyLessonSchema({ task: z.string() }))
})

/**
 * Public Studyplan schema.
 * Extends the base Studyplan schema by adding an `id` field.
 */
export const PublicStudyplanSchema = BaseStudyplanSchema.extend({
  id: z.string().uuid()
})

/**
 * User Studyplan schema.
 * Differs from the base Studyplan schema in that its tasks are objects that contain a `goal` field and a `completed_at` field.
 * Also includes an `original_id` field that points to the public studyplan in the database.
 */
export const UserStudyplanSchema = BasicDataSchema.extend({
  original_id: z.string().uuid(),
  daily_lessons: z.array(
    createDailyLessonSchema({
      task: z.object({
        goal: z.string(),
        completed_at: z.string().nullable()
      })
    })
  )
})
