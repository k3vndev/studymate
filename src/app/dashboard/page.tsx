'use client'

import { Background } from '@@/Background/Background'
import { Glow } from '@@/Background/Glow'
import { GalleryStudyplans } from '@@/GalleryStudyplans/GalleryStudyplans'
import { Main } from '@@/Main'
import { Sidebar } from '@@/Sidebar'
import { TodaysTasksSection } from '@@/TodaysTasks/TodaysTasksSection'
import { DailyStreakSection } from '@@/routes/dashboard/DailyStreakSection/DailyStreakSection'
import { InitialSection } from '@@/routes/dashboard/InitialSection'
import { useUserStudyplan } from '@hooks/useUserStudyplan'

export default function DashboardPage() {
  const { userStudyplan, isLoading, todaysTasks } = useUserStudyplan()

  return (
    <>
      <Main className='gap-12 h-full'>
        <InitialSection userStudyplan={userStudyplan} isLoading={isLoading} />
        <DailyStreakSection />
        <TodaysTasksSection tasks={todaysTasks} isLoading={isLoading} />

        <GalleryStudyplans
          title='Studyplans for you'
          storeKey='recommended'
          emptyMessage="Oops! We couldn't find any Studyplans for you."
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
