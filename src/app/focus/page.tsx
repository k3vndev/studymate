'use client'

import { Loadable } from '@@/Loadable'
import { Main } from '@@/Main'
import { Sidebar } from '@@/Sidebar'
import { useUserStudyplan } from '@hooks/useUserStudyplan'
import { CurrentTask } from './CurrentTask'
import { InfoHeader } from './InfoHeader'
import { Timer } from './Timer'

export default function FocusPage() {
  const { userStudyplan, isOnLastDay, todaysTasks, isLoading, currentDay } = useUserStudyplan()

  return (
    <>
      <Main className='gap-12 max-h-full min-h-full relative'>
        <Loadable isLoading={isLoading}>
          {userStudyplan && (
            <div className='flex flex-col items-center h-full justify-between animate-fade-in-fast'>
              <InfoHeader name={userStudyplan.name} currentDay={currentDay} />
              <Timer />
              <CurrentTask {...{ isOnLastDay, todaysTasks, currentDay }} />
            </div>
          )}
        </Loadable>
      </Main>
      <Sidebar />
    </>
  )
}
