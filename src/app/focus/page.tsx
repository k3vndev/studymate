'use client'

import { useUserPrompts } from '@/hooks/useUserPrompts'
import { Background } from '@@/Background/Background'
import { Glow } from '@@/Background/Glow'
import { Button, ErrorCard, Gigant, Message } from '@@/ErrorCard'
import { Loadable } from '@@/Loadable'
import { Main } from '@@/Main'
import { Sidebar } from '@@/Sidebar'
import { MagicWandIcon } from '@@/icons'
import { useUserStudyplan } from '@hooks/useUserStudyplan'
import { CurrentTask } from './CurrentTask'
import { InfoHeader } from './InfoHeader'
import { Timer } from './Timer'

export default function FocusPage() {
  const { userStudyplan, isLoading, currentDay } = useUserStudyplan()
  const prompts = useUserPrompts()

  return (
    <>
      <Main className='gap-12 max-h-full min-h-full relative sm:pb-8 pb-4'>
        <Loadable isLoading={isLoading}>
          {userStudyplan ? (
            <div className='flex flex-col items-center h-full justify-between animate-fade-in-fast'>
              <InfoHeader name={userStudyplan.name} currentDay={currentDay} />
              <Timer studyplanId={userStudyplan.original_id} />
              <CurrentTask />
            </div>
          ) : (
            <ErrorCard className='self-center'>
              <Gigant>No Studyplan?</Gigant>
              <Message>
                It seems you don't have a studyplan yet. Let's create one to get started on your focus
                journey!
              </Message>
              <Button onClick={prompts.createStudyplan}>
                <MagicWandIcon />
                Create Studyplan
              </Button>
            </ErrorCard>
          )}
        </Loadable>
      </Main>

      <Sidebar />

      <Background>
        <Glow className='bg-[#6308f6]/25' pos='left-top' />
        <Glow className='bg-[#5f25fe]/25' pos='right-bottom' />
      </Background>
    </>
  )
}
