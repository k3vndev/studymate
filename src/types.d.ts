import type { PromptRequestSchema as PromptRequestSchemaType } from '@/lib/schemas/PromptRequest'
import type { CATEGORIES } from '@consts'
import type { z } from 'zod'
import type { BaseStudyplanSchema, PublicStudyplanSchema, UserStudyplanSchema } from './lib/schemas/Studyplan'
import type { StudyplanPublicSchema } from './lib/schemas/StudyplanPublic'

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

// -- Schemas --
export type PromptRequestSchema = z.infer<typeof PromptRequestSchemaType>

// -- Studyplan schemas --

/**
 * Base Studyplan schema.
 * Like most Studyplans, its tasks are simple strings that simply represent its goals.
 */
export type BaseStudyplan = z.infer<typeof BaseStudyplanSchema>

/**
 * Extends the base Studyplan schema by adding an `id` field.
 */
export type PublicStudyplan = z.infer<typeof PublicStudyplanSchema>

/**
 * Differs from the base Studyplan schema in that its tasks are objects that contain a `goal` field and a `completed_at` field.
 * Also includes an `original_id` field that points to the public studyplan in the database.
 */
export type UserStudyplan = z.infer<typeof UserStudyplanSchema>

/**
 * A Studyplan that is used in a chat message.
 * Includes the base Studyplan fields, as well as an `original_id` field that points to the public studyplan in the database and a `chat_message_id` field that points to the chat message in which it is included.
 */
export type ChatStudyplan = {
  original_id: string | null
  chat_message_id: string | null
} & BaseStudyplan

/**
 * A union type of all the Studyplan types used in the app.
 */
export type StudyplanUnion = BaseStudyplan | PublicStudyplan | ChatStudyplan | UserStudyplan

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

export interface StudySession {
  started_at: string
  last_ping_at: string | null
  ended_at: string | null
  studyplan_id: string | null
  id: string
}

// -- Request bodies --

export type StartStudyplanReqBody = BaseStudyplan | string

export interface CompleteTaskReqBody {
  index: number
  clientTimezone: string
}

export interface CreateStudySessionReqBody {
  studyplanId: string
  clientTimezone: string
}

export interface UpdateStudySessionReqBody {
  sessionId: string
  clientTimezone: string
}
