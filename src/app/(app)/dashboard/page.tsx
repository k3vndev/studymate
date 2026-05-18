'use client'

import { useUserData } from '@/hooks/useUserData'
import { dataFetch } from '@/lib/utils/dataFetch'
import { Background } from '@@/Background/Background'
import { Glow } from '@@/Background/Glow'
import { GalleryStudyplans } from '@@/GalleryStudyplans/GalleryStudyplans'
import { Main } from '@@/Main'
import { Sidebar } from '@@/Sidebar'
import { TodaysTasksSection } from '@@/TodaysTasks/TodaysTasksSection'
import { DailyStreakSection } from '@@/routes/dashboard/DailyStreakSection/DailyStreakSection'
import { InitialSection } from '@@/routes/dashboard/InitialSection'
import { useUserStudyplan } from '@hooks/useUserStudyplan'
import { useStudyplansStore } from '@store/useStudyplansStore'
import type { PublicStudyplan } from '@types'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { userStudyplan, isLoading, todaysTasks } = useUserStudyplan()
  const { isLoggedIn } = useUserData()
  const [randomStudyplansIds, setRandomStudyplansIds] = useState<string[]>()
  const addStudyplans = useStudyplansStore(s => s.addStudyplans)

  useEffect(() => {
    if (isLoggedIn !== false) return

    dataFetch<PublicStudyplan[]>({
      url: '/api/studyplans?limit=15',
      onSuccess: data => {
        addStudyplans(...data)
        setRandomStudyplansIds(data.map(s => s.id))
      }
    })
  }, [isLoggedIn])

  return (
    <>
      <Main className='gap-12 h-full'>
        <InitialSection userStudyplan={userStudyplan} isLoading={isLoading} />
        {isLoggedIn !== false && (
          <>
            <DailyStreakSection />
            <TodaysTasksSection tasks={todaysTasks} isLoading={isLoading} />
          </>
        )}

        <GalleryStudyplans
          title='Studyplans for you'
          emptyMessage="Oops! We couldn't find any Studyplans for you."
          storeKey={isLoggedIn ? 'recommended' : undefined}
          customStudyplansListIds={randomStudyplansIds}
        />
      </Main>
      <Sidebar />

      <Background>
        <Glow className='bg-[#7331ff]/15' pos='left-top' />
        <Glow className='bg-[#6A71FC]/20' pos='right-bottom' />
      </Background>
    </>
  )
}
