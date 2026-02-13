import { promptAIModel } from '@/app/api/utils/ai-model/promptAIModel'
import { dataParser } from '@/app/api/utils/dataParser'
import { ChatStreamProcessor } from '@/lib/utils/ChatStreamProcessor'
import { StudyplanStreamParser } from '@/lib/utils/StudyplanStreamParser'
import { getUserId } from '@api/utils/getUserId'
import { USER_MAX_MESSAGE_LENGTH } from '@consts'
import { PromptRequestSchema } from '@schemas/PromptRequest'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type {
  ChatMessage,
  DBChatMessages,
  PromptRequestSchema as PromptRequestSchemaType,
  StreamResponseMessage
} from '@types'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import type { ChatCompletionMessageParam } from 'openai/src/resources/index.js'
import { databaseQuery } from '../utils/databaseQuery'
import { response } from '../utils/response'

// Get all previous chat messages
export const GET = async () => {
  try {
    const supabase = createServerComponentClient({ cookies })

    type QueryType = { chat_with_mate: DBChatMessages[] }
    const data = await databaseQuery<QueryType[]>(supabase.from('users').select('chat_with_mate'))

    if (data.length === 0) {
      return response(false, 401)
    }

    const [{ chat_with_mate }] = data

    if (chat_with_mate === null) {
      return response(true, 200, { data: [] })
    }

    const parsedMessages = dataParser.fromStudyplansInClientMessages(chat_with_mate).toObject()
    return response(true, 200, { data: parsedMessages })
  } catch {
    return response(false, 500)
  }
}

// Send a message to Mate and get a response
export const POST = async (req: NextRequest) => {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is logged in
  const userId = await getUserId({ supabase })
  if (userId === null) return response(false, 401)

  let chatMessages: ChatCompletionMessageParam[]
  let userMessage: string
  let userData: PromptRequestSchemaType['user_data']

  try {
    // Extract user message
    const reqBody = await req.json()
    const { messages: previousChatMessages, user_data } = await PromptRequestSchema.parseAsync(reqBody)

    const newChatMessage = previousChatMessages.pop()

    if (newChatMessage?.role !== 'user') {
      return response(false, 400, { msg: 'The latest message did not come form the user' })
    }

    const { content: newMessage } = newChatMessage

    // Check if user message is too long
    if (newMessage.length > USER_MAX_MESSAGE_LENGTH) {
      return response(false, 400, { msg: 'User message was too long' })
    }

    // Extract new user message and previous messages
    userMessage = newMessage
    chatMessages = dataParser.fromClientMessagesToModelPrompt(previousChatMessages)

    // Extract user data
    userData = user_data
  } catch {
    return response(false, 400, { msg: 'Messages or user data are missing or invalid' })
  }

  try {
    // Send prompt to the AI Model
    const stream = await promptAIModel(
      { userData, prevMessages: chatMessages },
      { role: 'user', content: userMessage }
    )

    const streamMessages: StreamResponseMessage[] = []
    const streamProcessor = new ChatStreamProcessor()

    // -- Write data to stream messages --

    const writeToStreamMessages = (type: StreamResponseMessage['type'], chunk: string) => {
      const { length } = streamMessages

      // Check if theres no messages or the last one is different in type
      if (!length || streamMessages[length - 1].type !== type) {
        // Create a new message and replace old buffer
        streamMessages.push({ type: type, content: chunk })
        return
      }
      // If not, write to the last message (same type)
      streamMessages[length - 1].content += chunk
    }
    streamProcessor.onWriteMarkdown = chunk => writeToStreamMessages('message', chunk)
    streamProcessor.onWriteStudyplan = chunk => writeToStreamMessages('studyplan', chunk)

    // -- Read from stream --

    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          const chunk = event.choices?.[0]?.delta?.content

          if (chunk) {
            controller.enqueue(new TextEncoder().encode(chunk))
            streamProcessor.processNewChunk(chunk)
          }
        }

        // -- Stream finished --
        controller.close()
        let studyplanIsNotValid = false

        // Parse messages for database
        const parsedMessages: ChatMessage[] = streamMessages.map(({ type, content }) => {
          if (type === 'message') {
            return { role: 'assistant', content } as ChatMessage
          }

          // Parse Studyplan
          const studyplanParser = new StudyplanStreamParser()
          const lines = content.split('\n')
          for (const line of lines) {
            studyplanParser.processNewChunk(line)
          }
          const studyplan = studyplanParser.getFullStudyplan()
          studyplanIsNotValid = !studyplan

          return { role: 'studyplan', content: studyplan } as ChatMessage
        })

        // Prevent saving messages with a not valid studyplan
        if (studyplanIsNotValid) return

        const new_msgs = dataParser.fromStudyplansInClientMessages(parsedMessages).toStringified()
        new_msgs.unshift({ role: 'user', content: userMessage })

        // Save messages on database by calling the postgress function
        await supabase.rpc('append_chats', { user_uuid: userId, new_msgs })
      }
    })

    // Return the stream
    return new NextResponse(readable)
  } catch {
    return response(false, 500)
  }
}

// Save messages to database
export const PATCH = async (req: NextRequest) => {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is logged in
  const userId = await getUserId({ supabase })
  if (userId === null) return response(false, 401)

  let chatMessages: ChatMessage[]

  try {
    const reqBody = await req.json()
    const parsedMessages = await PromptRequestSchema.shape.messages.parseAsync(reqBody)
    chatMessages = parsedMessages
  } catch {
    return response(false, 400, { msg: 'Messages are missing or invalid' })
  }

  try {
    const parsedMessages = dataParser.fromStudyplansInClientMessages(chatMessages).toStringified()

    await supabase
      .from('users')
      .update([{ chat_with_mate: parsedMessages }])
      .eq('id', userId)

    return response(true, 200)
  } catch {
    return response(false, 500)
  }
}
