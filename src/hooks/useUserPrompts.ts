import { USER_PROMPTS } from '@consts'
import { useChatMessages } from '@hooks/useChatMessages'
import { useChatStore } from '@store/useChatStore'
import { usePathname, useRouter } from 'next/navigation'

/**
 * A custom hook that provides functions to trigger user prompts in the chat interface. It also handles redirection to the chat page if the user is not currently on it.
 * @returns An object containing functions to trigger specific user prompts, a blank prompt, and a custom prompt.
 */
export const useUserPrompts = () => {
  const setHighlihtedMessage = useChatStore(s => s.setHighlihtedMessage)
  useChatMessages()

  const router = useRouter()
  const pathname = usePathname()

  const { CREATE_STUDYPLAN, EXPLAIN_TASKS, WHAT_CAN_YOU_DO, WHATS_NEXT } = USER_PROMPTS

  const prompt = (message: string) => {
    setHighlihtedMessage(message)

    // Detect if user is currently on the chat page and redirect if not
    const isOnChatPage = pathname.startsWith('/chat')
    if (!isOnChatPage) router.push('/chat')
  }

  return {
    createStudyplan: () => prompt(CREATE_STUDYPLAN),
    explainTasks: () => prompt(EXPLAIN_TASKS),
    whatCanYouDo: () => prompt(WHAT_CAN_YOU_DO),
    whatsNext: () => prompt(WHATS_NEXT),
    blank: () => prompt(''),
    custom: prompt
  }
}
