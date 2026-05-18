'use client'

import { ErrorCard } from '@/components/ErrorCard'
import { ArrowIcon } from '@/components/icons'
import { useLoginRedirect } from '@/hooks/useLoginRedirect'
import { useUserData } from '@/hooks/useUserData'
import { Background } from '@@/Background/Background'
import { Glow } from '@@/Background/Glow'
import { GalleryStudyplans } from '@@/GalleryStudyplans/GalleryStudyplans'
import { Main } from '@@/Main'
import { Sidebar } from '@@/Sidebar'
import { StudySessionsSection } from '@@/routes/profile/StudySessionsSection'
import { UserSection } from '@@/routes/profile/UserSection'

export default function ProfilePage() {
  const { isLoggedIn } = useUserData()
  const loginRedirect = useLoginRedirect('/profile')

  return (
    <>
      <Main className='flex flex-col gap-16'>
        {isLoggedIn !== false ? (
          <>
            <UserSection />

            <StudySessionsSection />

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
          </>
        ) : (
          <ErrorCard
            title="You're not logged in"
            paragraph='Log in to access your profile, view your saved and completed Studyplans, and track your learning journey!'
            button={{
              icon: <ArrowIcon className='-rotate-90' />,
              onClick: loginRedirect,
              text: 'Log in to Studymate'
            }}
          />
        )}
      </Main>

      <Sidebar />

      <Background className='bg-[#020202]'>
        <Glow className='bg-[#6313ED]/20' pos='left-top' margin={0} />
        <Glow className='bg-[#6313ED]/10' pos='right-bottom' margin={0} />
      </Background>
    </>
  )
}
