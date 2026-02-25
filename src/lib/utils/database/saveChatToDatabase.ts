import { CONTENT_JSON } from '@consts'
import type { ChatMessage } from '@types'
import { dataFetch } from '../dataFetch'

export const saveChatToDatabase = (chatMessages: ChatMessage[] | null) =>
  new Promise<void>((resolve, reject) => {
    if (!chatMessages) {
      reject()
      return
    }

    dataFetch({
      url: '/api/chat',
      options: {
        method: 'PATCH',
        headers: CONTENT_JSON,
        body: JSON.stringify(chatMessages)
      },
      onSuccess: resolve,
      onError: () => {
        console.error('Error saving chat to database')
        reject()
      }
    })
  })
