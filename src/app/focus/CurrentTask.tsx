'use client'

import { useUserStudyplan } from '@/hooks/useUserStudyplan'
import { TasksContext } from '@/lib/context/TasksContext'
import { dataFetch } from '@/lib/utils/dataFetch'
import { getClientTimezone } from '@/lib/utils/getClientTimezone'
import { useUserStore } from '@/store/useUserStore'
import { Badge } from '@components/Badge'
import { CONTENT_JSON } from '@consts'
import { useVerticalNavigation } from '@hooks/useVerticalNavigation'
import type { CompleteTaskReqBody, UserStudyplan } from '@types'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Buttons } from './Buttons'
import { TaskTile } from './TaskTile'
import { TasksNavigation } from './TasksNavigation'

export const CurrentTask = () => {
  const [selectedTask, setSelectedTask] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [displayCompletedMessage, setDisplayCompletedMessage] = useState('')

  const ulRef = useRef<HTMLUListElement>(null)
  const setTaskDone = useUserStore(s => s.setTaskDone)
  const router = useRouter()

  const { isOnLastDay, todaysTasks, currentDay, areTodaysTasksAllDone, studyplanIsCompleted } =
    useUserStudyplan()

  const searchParams = useSearchParams()

  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)
  const SCROLL_COOLDOWN = 150

  // Load task recieved on query params
  useEffect(() => {
    const taskIndex = Number(searchParams.get('task'))

    if (taskIndex && !Number.isNaN(taskIndex) && taskIndex <= todaysTasks.length) {
      scrollToTask(taskIndex - 1, 'instant')
    }

    if (studyplanIsCompleted) {
      setDisplayCompletedMessage('You have completed your studyplan! - Amazing job! 🥳')
    } else if (areTodaysTasksAllDone) {
      setDisplayCompletedMessage('You have completed all your tasks of today! - Good job! 🎉')
    }
  }, [areTodaysTasksAllDone])

  const scrollToTask = (index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!ulRef.current || index < 0 || index >= todaysTasks.length) return

    const { height } = ulRef.current.getBoundingClientRect()
    ulRef.current.scrollTo({ top: height * index - 2, behavior })
  }

  const completeTask = () => {
    setIsLoading(true)

    const requestBody: CompleteTaskReqBody = {
      index: selectedTask,
      clientTimezone: getClientTimezone()
    }

    dataFetch<string>({
      url: '/api/user/studyplan/tasks',
      options: {
        method: 'POST',
        headers: CONTENT_JSON,
        body: JSON.stringify(requestBody)
      },
      onSuccess: timestamp => setTaskDone(selectedTask, timestamp, currentDay),
      onFinish: () => setIsLoading(false)
    })
  }

  useVerticalNavigation({
    currentIndex: selectedTask,
    maxIndex: todaysTasks.length - 1,
    action: newIndex => scrollToTask(newIndex)
  })

  // Handle wheel event to scroll the list
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (scrollTimeout.current) return

      scrollTimeout.current = setTimeout(() => {
        scrollTimeout.current = null
      }, SCROLL_COOLDOWN)

      const { deltaY } = e

      const add = deltaY > 0 ? 1 : -1
      scrollToTask(selectedTask + add)
    }

    ulRef.current?.addEventListener('wheel', handleWheel)
    return () => ulRef.current?.removeEventListener('wheel', handleWheel)
  }, [selectedTask])

  // Handle task slection based on scroll position
  const handleULScroll = (e: React.UIEvent<HTMLUListElement>) => {
    if (!ulRef.current) return

    const { scrollTop } = e.currentTarget
    const index = Math.round(scrollTop / ulRef.current.clientHeight)

    if (selectedTask === index) return

    setSelectedTask(index)
    router.replace(`/focus?task=${index}`)
  }

  if (displayCompletedMessage) {
    const [firstPart, secondPart] = displayCompletedMessage.split(' - ')

    return (
      <span className='text-lg text-white/50 text-center mb-1 animate-fade-in-fast text-balance'>
        {firstPart}, <span className='font-semibold text-white/75'>{secondPart}</span>
      </span>
    )
  }

  return (
    <TasksContext.Provider
      value={{
        tasks: todaysTasks,
        selectedTask,
        selectedTaskIsDone: !!todaysTasks[selectedTask].completed_at,
        allTasksAreDone: areTodaysTasksAllDone,
        isOnLastDay,
        swapTask: scrollToTask,
        completeTask,
        isLoading
      }}
    >
      <article
        className={`
          flex bg-card-background border border-card-border 
          rounded-2xl xs:px-7 px-5 xs:py-6 py-5 md:gap-7 gap-4 max-w-[40rem] w-full animate-fade-in-fast
        `}
      >
        <main className='flex flex-col gap-3 w-full'>
          <Badge>CURRENT TASK</Badge>
          <ul
            className={`
              w-full flex flex-col h-20 rounded-lg border border-gray-50 
              overflow-y-scroll scrollbar-hide snap-y snap-mandatory
            `}
            ref={ulRef}
            onScroll={handleULScroll}
          >
            {todaysTasks.map((task, i) => (
              <TaskTile goal={task.goal} done={!!task.completed_at} key={i} className='snap-start' />
            ))}
          </ul>
          <Buttons />
        </main>
        <TasksNavigation />
      </article>
    </TasksContext.Provider>
  )
}
