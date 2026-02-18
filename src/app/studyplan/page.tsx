'use client'

import { Button, ErrorCard, Gigant, Message } from '@@/ErrorCard'
import { Loadable } from '@@/Loadable'
import { Main } from '@@/Main'
import { Sidebar } from '@@/Sidebar'
import { Studyplan } from '@@/Studyplan/Studyplan'
import { MagicWandIcon } from '@@/icons'
import { useUserPrompts } from '@hooks/useUserPrompts'
import { useUserStudyplan } from '@hooks/useUserStudyplan'

export default function UserStudyplanPage() {
  const { userStudyplan, isLoading } = useUserStudyplan()
  const prompts = useUserPrompts({ redirect: true })

  return (
    <>
      <Main className='gap-12 h-full relative'>
        <Loadable isLoading={isLoading}>
          {userStudyplan ? (
            <Studyplan studyplan={userStudyplan} usersCurrent />
          ) : (
            <ErrorCard className='left-1/2 -translate-x-1/2'>
              <Gigant>Whoops...</Gigant>
              <Message>You currently don't have a Studyplan</Message>
              <Button onClick={prompts.createStudyplan}>
                <MagicWandIcon />
                Create Studyplan
              </Button>
            </ErrorCard>
          )}
        </Loadable>
      </Main>

      <Sidebar />
    </>
  )
}
