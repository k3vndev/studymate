import { ChatStreamProcessor } from '@/lib/utils/ChatStreamProcessor'
import { StudyplanStreamParser } from '@/lib/utils/StudyplanStreamParser'
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

  const loadChatHistory = () => {
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
  useEffect(loadChatHistory, [])

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
    await handleMessageStream(reader, messagesHistory)
  }

  const handleMessageStream = async (reader: ReadableStreamDefaultReader, messagesHistory: ChatMessage[]) => {
    setIsWaitingResponse(false)

    const decoder = new TextDecoder()
    let fullMessage = ''
    const streamProcessor = new ChatStreamProcessor()
    const studyplanProcessor = new StudyplanStreamParser()

    const originalMessagesHistory = [...messagesHistory]

    // -- Stream processor callbacks --

    const onMessageEnd = () => {
      if (fullMessage.trim() === '' || isOnStudyplanError) return

      messagesHistory.push(createAssistantMessage(fullMessage))
      setMessages(messagesHistory)

      fullMessage = ''
      setIsStreamingResponse(false)
    }

    // Update the message in the chat as new chunks of text are received from the stream
    streamProcessor.onWriteMarkdown = (textChunk: string) => {
      if (isOnStudyplanError) return

      fullMessage += textChunk
      const currentMessage = createAssistantMessage(fullMessage)
      setMessages([...messagesHistory, currentMessage])
    }

    // Create a new message to show studyplan content as it's being generated
    streamProcessor.onStartWritingStudyplan = () => {
      onMessageEnd()
      setMessages([...messagesHistory, { role: 'generating_studyplan', content: {} }])
    }

    streamProcessor.onWriteStudyplan = textChunk => {
      console.log(textChunk)
      studyplanProcessor.processNewChunk(textChunk)
    }

    studyplanProcessor.onStudyplanContentUpdate = content => {
      // Update the message content with the current state of the generated Studyplan content
      setMessages(prev => {
        if (!prev || prev.length === 0) return prev

        const prevClone = structuredClone(prev)
        const lastMessage = prevClone[prevClone.length - 1]

        if (lastMessage.role !== 'generating_studyplan') return prev

        lastMessage.content = content
        return prevClone
      })
    }

    streamProcessor.onFinishWritingStudyplan = () => {
      const fullStudyplan = studyplanProcessor.getFullStudyplan()

      if (fullStudyplan) {
        const chatStudyplan: ChatStudyplan = {
          ...fullStudyplan,
          original_id: null,
          chat_message_id: null
        }
        // Update the message content with the final generated Studyplan content
        messagesHistory.push({ role: 'studyplan', content: chatStudyplan })
        setMessages(messagesHistory)
      } else {
        onStudyplanError()
      }
    }

    const onStudyplanError = () => {
      // Set error flags
      isOnStudyplanError = true
      setIsStreamingResponse(false)

      requestAnimationFrame(() => {
        // An UI update later to avoid reseting the error itself
        setIsOnChatError(true)
        setTimeout(() => window.scrollTo({ top: document.documentElement.clientHeight }), 150)
      })

      // Reset messages
      setMessages([...originalMessagesHistory])
    }
    studyplanProcessor.onStudyplanError = onStudyplanError

    // -- Main loop to read the stream --

    let isOnStudyplanError = false

    while (!isOnStudyplanError) {
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
    loadPreviousMessages: loadChatHistory,
    isStreamingResponse,
    setIsStreamingResponse,
    inputProps: {
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      value: userInput
    }
  }
}
