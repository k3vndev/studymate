'use client'

import { Loadable } from '@components/Loadable'
import { Main } from '@components/Main'
import { Sidebar } from '@components/Sidebar'
import { useUserStudyplan } from '@hooks/useUserStudyplan'
import { TodaysTasks } from './TodaysTasks'

export default function TasksPage() {
  const { userStudyplan, currentDay, isLoading } = useUserStudyplan({ redirectTo: '/studyplan' })
  const todaysTasks = userStudyplan?.daily_lessons[currentDay - 1]

  return (
    <>
      <Main className='gap-12 h-full relative'>
        <Loadable isLoading={isLoading}>{todaysTasks && <TodaysTasks {...todaysTasks} />}</Loadable>
      </Main>

      <Sidebar />
    </>
  )
}
