'use client'

import { TasksContext } from '@/lib/context/TasksContext'
import { dataFetch } from '@/lib/utils/dataFetch'
import { useUserStore } from '@/store/useUserStore'
import { Badge } from '@components/Badge'
import { CONTENT_JSON } from '@consts'
import { useVerticalNavigation } from '@hooks/useVerticalNavigation'
import type { UserStudyplan } from '@types'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Buttons } from './Buttons'
import { TaskTile } from './TaskTile'
import { TasksNavigation } from './TasksNavigation'

interface Props {
  todaysTasks: UserStudyplan['daily_lessons'][number]['tasks']
  isOnLastDay: boolean
  currentDay: number
}

export const CurrentTask = ({ todaysTasks: tasks, isOnLastDay, currentDay }: Props) => {
  const [selectedTask, setSelectedTask] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isShowingCompletedMessage, setIsShowingCompletedMessage] = useState(false)

  const ulRef = useRef<HTMLUListElement>(null)
  const setTaskDone = useUserStore(s => s.setTaskDone)
  const router = useRouter()

  const allTasksAreDone = tasks.every(t => t.completed_at)
  const searchParams = useSearchParams()

  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)
  const SCROLL_COOLDOWN = 150

  // Load task recieved on query params
  useEffect(() => {
    const taskIndex = Number(searchParams.get('task'))

    if (taskIndex && !Number.isNaN(taskIndex) && taskIndex <= tasks.length) {
      scrollToTask(taskIndex - 1, 'instant')
    }
    setIsShowingCompletedMessage(allTasksAreDone)
  }, [])

  const scrollToTask = (index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!ulRef.current || index < 0 || index >= tasks.length) return

    const { height } = ulRef.current.getBoundingClientRect()
    ulRef.current.scrollTo({ top: height * index - 2, behavior })
  }

  const completeTask = () => {
    setIsLoading(true)

    dataFetch<string>({
      url: '/api/user/studyplan/tasks',
      options: {
        method: 'POST',
        headers: CONTENT_JSON,
        body: JSON.stringify({ index: selectedTask })
      },
      onSuccess: timestamp => setTaskDone(selectedTask, timestamp, currentDay),
      onFinish: () => setIsLoading(false)
    })
  }

  useVerticalNavigation({
    currentIndex: selectedTask,
    maxIndex: tasks.length - 1,
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
  }, [ulRef.current, selectedTask])

  // Handle task slection based on scroll position
  const handleULScroll = (e: React.UIEvent<HTMLUListElement>) => {
    if (!ulRef.current) return

    const { scrollTop } = e.currentTarget
    const index = Math.round(scrollTop / ulRef.current.clientHeight)

    setSelectedTask(index)
    router.replace(`/focus?task=${selectedTask}`)
  }

  return !isShowingCompletedMessage ? (
    <TasksContext.Provider
      value={{
        tasks,
        selectedTask,
        selectedTaskIsDone: !!tasks[selectedTask].completed_at,
        allTasksAreDone,
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
            {tasks.map((task, i) => (
              <TaskTile goal={task.goal} done={!!task.completed_at} key={i} className='snap-start' />
            ))}
          </ul>
          <Buttons />
        </main>
        <TasksNavigation />
      </article>
    </TasksContext.Provider>
  ) : (
    <span className='text-lg text-white/50 text-center mb-1 animate-fade-in-fast text-balance'>
      You have completed all your tasks of today,{' '}
      <span className='font-semibold text-white/75'>Good job! 🎉</span>
    </span>
  )
}
