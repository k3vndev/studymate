import type { MateResponseSchema as MateResponseSchemaType } from '@/lib/schemas/MateResponse'
import type { PromptRequestSchema as PromptRequestSchemaType } from '@/lib/schemas/PromptRequest'
import type { StudyplanSchema as StudyplanSchemaType } from '@/lib/schemas/Studyplan'
import type { CATEGORIES } from '@consts'
import type { z } from 'zod'

export type Category = (typeof CATEGORIES)[number]

export type ChatMessage =
  | {
      role: 'assistant' | 'user' | 'error'
      content: string
    }
  | {
      role: 'studyplan'
      content: ChatStudyplan
    }
  | {
      role: 'generating_studyplan'
      content: GeneratingStudyplanContent
    }

export interface GeneratingStudyplanContent {
  name?: string
  desc?: string
  category?: Category
  lessons_count?: number
  current_lesson?: string
}

export interface AlertData {
  header: string
  message: string

  acceptButton: {
    onClick: () => void | Promise<void>
    icon?: React.ReactNode
    text: string
  }
  rejectButton: {
    onClick: () => void
  }
}

// DB Responses
export interface DBUserStudyplanAndCurrentDayResponse {
  studyplan: DBUserStudyplan
  current_studyplan_day: DBCurrentStudyplanDay
}

export interface DBCurrentStudyplanDay {
  day: number
  last_updated: string
}

export interface DBStudyplansLists {
  studyplans_lists: {
    recommended: string[]
    completed: string[]
    saved: string[]
  }
}

export interface DBUserData {
  id: string
  user_name: string
  avatar_url: string
}

// Schemas
export type MateResponseSchema = z.infer<typeof MateResponseSchemaType>
export type PromptRequestSchema = z.infer<typeof PromptRequestSchemaType>

// Studyplan Shemas
/**
 * A studyplan that is not saved in the database. Describes the base form of a studyplan.
 *
 * It lacks of id, created_by, and other fields that are only available in database studyplans.
 */
export type StudyplanUnSaved = z.infer<typeof StudyplanSchemaType>

/**
 * A studyplan that is saved in the database. Describes a public studyplan.
 *
 * It has an id, created_by, and other fields that are only available in database studyplans.
 */
export type StudyplanSaved = {
  id: string
  created_by: string
} & StudyplanUnSaved

/**
 * A studyplan that is selected by the user.
 *
 * It features an original_id field that points to the public studyplan in the database.
 */
export type DBUserStudyplan = {
  original_id: string
} & StudyplanUnSaved

/**
 * A studyplan that is selected by the user.
 *
 * It features a current_day field and the original_id field that points to the public studyplan in the database.
 */
export type UserStudyplan = {
  current_day: number
} & DBUserStudyplan

/**
 * A studyplan that is used in a chat message.
 */
export type ChatStudyplan = {
  original_id: string | null
  chat_message_id: string | null
} & StudyplanUnSaved

/**
 * Describes the chat messages stored in the database.
 */
export interface DBChatMessages {
  role: 'user' | 'assistant' | 'studyplan'
  content: string
}

export interface ReusableComponent {
  className?: string
  style?: React.CSSProperties
}

export interface StreamResponseMessage {
  type: 'studyplan' | 'message'
  content: string
}
