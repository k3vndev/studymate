'use client'

import { Background } from '@@/Background/Background'
import { Glow } from '@@/Background/Glow'
import { GalleryStudyplans } from '@@/GalleryStudyplans/GalleryStudyplans'
import { Main } from '@@/Main'
import { Sidebar } from '@@/Sidebar'
import { StudySessionsChart } from '@@/routes/profile/StudySessionsChart'
import { UserSection } from '@@/routes/profile/UserSection'

export default function ProfilePage() {
  return (
    <>
      <Main className='flex flex-col gap-16'>
        <UserSection />

        <StudySessionsChart />

        <GalleryStudyplans
          title='Your saved Studyplans'
          storeKey='saved'
          emptyMessage='Looks a little empty... Start saving some Studyplans for later! 😌'
          carousel
        />
        <GalleryStudyplans
          title='Your completed Studyplans'
          storeKey='completed'
          emptyMessage='Complete Studyplans and show them off here. Make this place proud! 🎉'
          carousel
        />
      </Main>
      <Sidebar />

      <Background className='bg-[#020202]'>
        <Glow className='bg-[#6313ED]/20' pos='left-top' margin={0} />
        <Glow className='bg-[#6313ED]/10' pos='right-bottom' margin={0} />
      </Background>
    </>
  )
}
