import { ChatStreamProcessor } from '@/lib/utils/ChatStreamProcessor'
import { dataFetch } from '@/lib/utils/dataFetch'
import { useChatStore } from '@/store/useChatStore'
import { useStudyplansStore } from '@/store/useStudyplansStore'
import { CONTENT_JSON, EVENTS, USER_MAX_MESSAGE_LENGTH } from '@consts'
import { useEvent } from '@hooks/useEvent'
import { useUserStudyplan } from '@hooks/useUserStudyplan'
import type { ChatMessage, ChatStudyplan, PromptRequestSchema, StudyplanSaved } from '@types'
import { useEffect, useRef, useState } from 'react'

export const useChatMessages = () => {
  const messages = useChatStore(s => s.messages)
  const setMessages = useChatStore(s => s.setMessages)
  const setHighlihtedMessage = useChatStore(s => s.setHighlihtedMessage)
  const userInput = useChatStore(s => s.userInput)
  const setUserInput = useChatStore(s => s.setUserInput)

  const addStudyplans = useStudyplansStore(s => s.addStudyplans)
  const { userStudyplan } = useUserStudyplan()

  const [isWaitingResponse, setIsWaitingResponse] = useState(false)
  const [isStreamingResponse, setIsStreamingResponse] = useState(false)
  const [isOnChatError, setIsOnChatError] = useState(false)
  const [isOnLoadingError, setIsOnLoadingError] = useState(false)

  const tryAgainCallback = useRef<() => void>(() => {})

  const loadPreviousMessages = () => {
    if (messages) return
    setIsOnLoadingError(false)

    dataFetch<ChatMessage[]>({
      url: '/api/chat',
      onSuccess: newMessages => {
        setMessages(newMessages)
        preloadChatStudyplans(newMessages)
      },
      onError: () => setIsOnLoadingError(true),
      redirectOn401: true
    })
  }
  useEffect(loadPreviousMessages, [])

  const preloadChatStudyplans = (chatMessages: ChatMessage[]) => {
    const chatStudyplans: ChatStudyplan[] = chatMessages
      .filter(m => m.role === 'studyplan')
      .map(m => m.content)
    const studyplansIds = chatStudyplans.filter(s => s.original_id).map(s => s.original_id as string)

    dataFetch<StudyplanSaved[]>({
      url: '/api/studyplans',
      options: {
        headers: CONTENT_JSON,
        method: 'POST',
        body: JSON.stringify(studyplansIds)
      },
      onSuccess: studyplans => addStudyplans(...studyplans)
    })
  }

  // Resend message when user presses try again
  useEvent(EVENTS.ON_CHAT_TRY_AGAIN, tryAgainCallback.current, [isOnChatError])

  const parsePreviousMessages = (messages: ChatMessage[]) =>
    messages.filter(
      ({ role }) => role !== 'error' && role !== 'generating_studyplan'
    ) as PromptRequestSchema['messages']

  const messageMate = async (userMessage: string) => {
    if (messages === null) return

    setIsWaitingResponse(true)
    setIsOnChatError(false)

    // Add user message to chat history immediately. Filter out generating_studyplan messages
    const messagesHistory: ChatMessage[] = [...messages, { role: 'user', content: userMessage }]

    // Prepare the prompt for the AI model. New message is sent separately
    const promptData: PromptRequestSchema = {
      messages: parsePreviousMessages(messagesHistory),
      user_data: { current_studyplan: userStudyplan }
    }

    // Update UI
    setMessages(messagesHistory)

    // Send the prompt to the backend
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptData)
    })

    if (!res.body || !res.ok) {
      setIsOnChatError(true)
      setIsWaitingResponse(false)
      return
    }

    // Process the streaming response
    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    let fullMessage = ''

    setIsWaitingResponse(false)

    const onMessageEnd = () => {
      messagesHistory.push(createAssistantMessage(fullMessage))
      fullMessage = ''
      setIsStreamingResponse(false)
    }

    const streamProcessor = new ChatStreamProcessor()

    const writeMessage = (textChunk: string) => {
      fullMessage += textChunk

      const currentMessage = createAssistantMessage(fullMessage)
      setMessages([...messagesHistory, currentMessage])
    }

    streamProcessor.onWriteMarkdown = writeMessage
    streamProcessor.onWriteStudyplan = writeMessage

    streamProcessor.onStartWritingStudyplan = onMessageEnd
    streamProcessor.onFinishWritingStudyplan = onMessageEnd

    // Handle Studyplan content when the processor detects it in the stream
    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      if (value) {
        const chunk = decoder.decode(value)
        streamProcessor.processNewChunk(chunk)
        setIsStreamingResponse(true)
      }
    }

    onMessageEnd()
  }

  const createAssistantMessage = (content: string): ChatMessage => ({
    role: 'assistant',
    content
  })

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target

    if (value.length <= USER_MAX_MESSAGE_LENGTH) {
      setUserInput(value)
    }
  }

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    // Avoid sending empty messages
    const trimmedMessage = userInput.trim()
    if (trimmedMessage === '') return

    // Save try again callback
    tryAgainCallback.current = () => {
      messageMate(trimmedMessage)
    }

    // Send message to Mate
    messageMate(trimmedMessage)

    // Clear input and highlighted message
    setUserInput('')
    setHighlihtedMessage(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return {
    handleSubmit,
    isWaitingResponse,
    isOnChatError,
    isOnLoadingError,
    loadPreviousMessages,
    isStreamingResponse,
    setIsStreamingResponse,
    inputProps: {
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      value: userInput
    }
  }
}
