'use client'

import { Background } from '@components/Background/Background'
import { Glow } from '@components/Background/Glow'
import { GalleryStudyplans } from '@components/GalleryStudyplans/GalleryStudyplans'
import { Main } from '@components/Main'
import { Sidebar } from '@components/Sidebar'
import { UserSection } from './UserSection'

export default function ProfilePage() {
  return (
    <>
      <Main className='flex flex-col gap-16'>
        <UserSection />

        <GalleryStudyplans
          title='Your saved Studyplans'
          storeKey='saved'
          emptyMessage='Looks a little empty... Start saving some Studyplans! 😌'
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
