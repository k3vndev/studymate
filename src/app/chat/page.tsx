'use client'

import { ChatContext } from '@/lib/context/ChatContext'
import { useChatStore } from '@/store/useChatStore'
import { Button, ErrorCard, Gigant, Message } from '@components/ErrorCard'
import { Loadable } from '@components/Loadable'
import { Main } from '@components/Main'
import { useChatCustomScroll } from '@hooks/useChatCustomScroll'
import { useChatMessages } from '@hooks/useChatMessages'
import { useUserStudyplan } from '@hooks/useUserStudyplan'
import { ReloadIcon } from '@icons'
import { useState } from 'react'
import { ScrollHelper } from './ScrollHelper'
import { MessagesScreen } from './messages/MessagesScreen'
import { NoMessagesScreen } from './messages/NoMessagesScreen'

export default function ChatPage() {
  const [inputElementHeight, setInputElementHeight] = useState(0)
  useUserStudyplan()
  const messages = useChatStore(s => s.messages)

  const chatMessagesValues = useChatMessages()
  const { isWaitingResponse, isOnChatError, isOnLoadingError } = chatMessagesValues

  const customScrollValues = useChatCustomScroll({
    updateScrollOn: [isWaitingResponse, isOnChatError]
  })

  const classNames = {
    width: `3xl:w-[calc(100%-22vw-4rem-24rem)] 2xl:w-[calc(100%-22vw-4rem-16rem)] 
      xl:w-[calc(100%-22vw-4rem-8rem)] lg:w-[calc(100%-16rem)] sm:w-[calc(100%-4rem)]`,
    heigth: 'xl:h-[calc(100dvh-3rem)] max-xl:min-h-0 sm:h-[calc(100dvh-5.5rem)] h-dvh',
    right: '3xl:right-48 2xl:right-32 xl:right-16 lg:right-32 sm:right-8 right-0',
    rounded: 'xl:rounded-3xl sm:rounded-b-none sm:rounded-t-3xl rounded-none',
    border: 'xl:border sm:border sm:border-b-0 border-0'
  }

  const contextValue = {
    ...chatMessagesValues,
    ...customScrollValues,
    inputElementHeight,
    setInputElementHeight
  }

  return (
    <ChatContext.Provider value={contextValue}>
      <Main
        className={`
          items-center flex-col justify-between fixed xs:mt-0 mt-0
          sm:top-6 top-0 3xl:px-44 lg:px-28 sm:pt-0 pt-0 sm:py-0 py-0 
          ${classNames.rounded} ${classNames.border} ${classNames.width} ${classNames.heigth} ${classNames.right}
        `}
      >
        {!isOnLoadingError ? (
          <Loadable isLoading={!messages}>
            {messages?.length ? <MessagesScreen /> : <NoMessagesScreen />}
          </Loadable>
        ) : (
          <ErrorCard>
            <Gigant>Ooops...</Gigant>
            <Message>Sorry, couldn't load your messages</Message>
            <Button onClick={chatMessagesValues.loadPreviousMessages}>
              <ReloadIcon className='size-7 group-active:rotate-90 transition' />
              Try again
            </Button>
          </ErrorCard>
        )}
      </Main>

      <ScrollHelper scrollRef={customScrollValues.scrollRef} />
    </ChatContext.Provider>
  )
}
