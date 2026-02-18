import { useChatStore } from '@/store/useChatStore'
import { EVENTS } from '@consts'
import { useEvent } from '@hooks/useEvent'
import { useEffect, useRef, useState } from 'react'

const CHAT_ON_BOTTOM_SCROLL_THRESHOLD = 20

interface Params {
  updateScrollOn: unknown[]
}

export const useChatCustomScroll = ({ updateScrollOn }: Params) => {
  const chatMessages = useChatStore(s => s.messages)
  const [scrollIsOnBottom, setScrollIsOnBottom] = useState(true)
  const isOnInitialScroll = useRef(true)

  const listRef = useRef<HTMLUListElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Update scrollElement's height to increase body scroll
  useEffect(() => {
    const recalculateScrollHeight = () => {
      if (!listRef.current || !scrollRef.current) return
      listRef.current.style.overflowY = 'scroll'

      const { scrollHeight } = listRef.current

      // Apply scroll height
      listRef.current.style.overflowY = 'clip'
      const newHeight = `${scrollHeight}px`

      scrollRef.current.style.height = newHeight
      scrollRef.current.style.minHeight = newHeight
      scrollRef.current.style.maxHeight = newHeight
    }

    window.addEventListener('resize', recalculateScrollHeight)
    recalculateScrollHeight()

    return () => window.removeEventListener('resize', recalculateScrollHeight)
  }, [listRef.current, scrollRef.current, chatMessages, ...updateScrollOn])

  const handleScroll = () => {
    // Apply scroll made on the body to the chat
    if (listRef.current === null) return
    listRef.current.scrollTo({ top: window.scrollY })

    // Handle scroll on bottom checking logic
    const { scrollTop, scrollHeight, clientHeight } = listRef.current
    const scrollDifference = scrollHeight - scrollTop

    const newScrollIsOnBottom = Math.abs(clientHeight - scrollDifference) < CHAT_ON_BOTTOM_SCROLL_THRESHOLD
    setScrollIsOnBottom(newScrollIsOnBottom)
  }
  // Call the above function whenever the user scrolls
  useEvent('scroll', handleScroll, [scrollIsOnBottom])

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatMessages?.length && scrollIsOnBottom) {
      const behavior = isOnInitialScroll.current ? 'instant' : 'smooth'
      scrollToBottom(behavior)

      isOnInitialScroll.current = false
    }
  }, [chatMessages, ...updateScrollOn])

  // Scroll to bottom when the user presses the button
  useEvent(EVENTS.ON_CHAT_SCROLL_DOWN, () => scrollToBottom(), [])

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior })
  }

  return { listRef, scrollRef, scrollIsOnBottom }
}
