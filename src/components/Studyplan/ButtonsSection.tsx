import { StudyplanContext } from '@context/StudyplanContext'
import { useLoginRedirect } from '@hooks/useLoginRedirect'
import { useUserData } from '@hooks/useUserData'
import { LoadingIcon, RocketIcon } from '@icons'
import { useStudyplansStore } from '@store/useStudyplansStore'
import { throwConfetti } from '@utils/throwConfetti'
import { useContext, useEffect, useRef } from 'react'
import { ChipButton } from '../ChipButton'
import { CompleteButton } from './CompleteButton'
import { CompletedBadge } from './CompletedBadge'
import { SaveButton } from './SaveButton'
import { StartButton } from './StartButton'

export const ButtonsSection = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { usersCurrent, isCompleted, readyToComplete, userHasAnotherStudyplan, publicId } =
    useContext(StudyplanContext)
  const { isLoggedIn } = useUserData()
  const loginRedirect = useLoginRedirect(`/studyplan/${publicId}`)

  // Handle buttons responsiveness
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const thisElement = ref.current
      if (!thisElement?.previousElementSibling) return

      const elementSibling = thisElement.previousElementSibling as HTMLDivElement
      const { style } = thisElement

      style.width = 'fit-content'
      style.justifyContent = 'flex-end'

      if (thisElement.offsetTop !== elementSibling.offsetTop) {
        style.width = '100%'
        style.justifyContent = 'space-between'
      }
    }
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [ref.current])

  // Handle confetti
  const throwConfettiNextTime = useStudyplansStore(s => s.throwConfettiNextTime)
  const setThrowConfettiNextTime = useStudyplansStore(s => s.setThrowConfettiNextTime)

  useEffect(() => {
    if (throwConfettiNextTime && isCompleted) {
      setThrowConfettiNextTime(false)
      throwConfetti()
    }
  }, [isCompleted])

  // Render a loading icon when it's still loading the user data
  if (isLoggedIn === undefined) {
    return <LoadingIcon className='h-full aspect-square text-gray-10/50 animate-spin [scale:1.2]' />
  }

  if (!isLoggedIn) {
    return (
      <ChipButton onClick={loginRedirect}>
        <RocketIcon />
        Log in to start this Studyplan
      </ChipButton>
    )
  }

  return (
    <div className='flex justify-end gap-4' ref={ref}>
      {!usersCurrent ? (
        <>
          <SaveButton />
          {isCompleted ? <CompletedBadge /> : !userHasAnotherStudyplan && <StartButton />}
        </>
      ) : (
        readyToComplete && <CompleteButton />
      )}
    </div>
  )
}
