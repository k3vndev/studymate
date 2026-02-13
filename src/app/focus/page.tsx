'use client'

import { Loadable } from '@components/Loadable'
import { Main } from '@components/Main'
import { Sidebar } from '@components/Sidebar'
import { useUserStudyplan } from '@hooks/useUserStudyplan'
import { CurrentTask } from './CurrentTask'
import { InfoHeader } from './InfoHeader'
import { Timer } from './Timer'

export default function FocusPage() {
  const { userStudyplan, getUtilityValues, isLoading } = useUserStudyplan()
  const currentTaskValues = getUtilityValues()

  return (
    <>
      <Main className='gap-12 max-h-full min-h-full relative'>
        <Loadable isLoading={isLoading}>
          {userStudyplan && currentTaskValues && (
            <div className='flex flex-col items-center h-full justify-between animate-fade-in-fast'>
              <InfoHeader {...userStudyplan} />
              <Timer />
              <CurrentTask {...currentTaskValues} />
            </div>
          )}
        </Loadable>
      </Main>
      <Sidebar />
    </>
  )
}
