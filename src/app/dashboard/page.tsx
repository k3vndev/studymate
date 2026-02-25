'use client'

import { Background } from '@@/Background/Background'
import { Glow } from '@@/Background/Glow'
import { DailyStreakSection } from '@@/DailyStreak/DailyStreakSection'
import { GalleryStudyplans } from '@@/GalleryStudyplans/GalleryStudyplans'
import { Main } from '@@/Main'
import { Sidebar } from '@@/Sidebar'
import { InitialSection } from './InitialSection'

export default function DashboardPage() {
  return (
    <>
      <Main className='gap-12 h-full'>
        <InitialSection />

        <DailyStreakSection />

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
