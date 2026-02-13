'use client'

import { Background } from '@components/Background/Background'
import { Glow } from '@components/Background/Glow'
import { GalleryStudyplans } from '@components/GalleryStudyplans/GalleryStudyplans'
import { Main } from '@components/Main'
import { Sidebar } from '@components/Sidebar'
import { InitialSection } from './InitialSection'

export default function DashboardPage() {
  return (
    <>
      <Main className='gap-12 h-full'>
        <InitialSection />

        <GalleryStudyplans
          title='Studyplans for you'
          storeKey='recommended'
          emptyMessage="Oops! We couldn't find any Studyplans for you."
        />
      </Main>
      <Sidebar />

      <Background>
        <Glow className='bg-[#7331ff]/20' pos='left-top' />
        <Glow className='bg-[#6A71FC]/25' pos='right-bottom' />
      </Background>
    </>
  )
}
