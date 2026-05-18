'use client'

import { ErrorCard } from '@@/ErrorCard'
import { Loadable } from '@@/Loadable'
import { Main } from '@@/Main'
import { Sidebar } from '@@/Sidebar'
import { Studyplan } from '@@/Studyplan/Studyplan'
import { MagicWandIcon } from '@@/icons'
import { useUserPrompts } from '@hooks/useUserPrompts'
import { useUserStudyplan } from '@hooks/useUserStudyplan'

export default function UserStudyplanPage() {
  const { userStudyplan, isLoading } = useUserStudyplan()
  const prompts = useUserPrompts()

  return (
    <>
      <Main className='gap-12 h-full relative'>
        <Loadable isLoading={isLoading}>
          {userStudyplan ? (
            <Studyplan studyplan={userStudyplan} usersCurrent />
          ) : (
            <ErrorCard
              title='We hear crickets...'
              paragraph="You currently don't have a Studyplan. Create one to start your learning journey!"
              button={{
                icon: <MagicWandIcon />,
                onClick: prompts.createStudyplan,
                text: 'Create Studyplan'
              }}
            />
          )}
        </Loadable>
      </Main>

      <Sidebar />
    </>
  )
}
