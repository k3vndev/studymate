import { StudyplanContext } from '@/lib/context/StudyplanContext'
import { LoadingIcon } from '@icons'
import { useContext, useEffect, useRef } from 'react'
import { CompletedBadge } from './CompletedBadge'
import { FinishButton } from './FinishButton'
import { SaveButton } from './SaveButton'
import { StartButton } from './StartButton'

export const ButtonsSection = () => {
  const ref = useRef<HTMLDivElement>(null)

  const { usersCurrent, isCompleted, justCompleted, userHasAnotherStudyplan, isLoadingUserData } =
    useContext(StudyplanContext)

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

  // Render a loading icon when it's still loading the user data
  if (isLoadingUserData) {
    return <LoadingIcon className='h-full aspect-square text-gray-10/50 animate-spin [scale:1.2]' />
  }

  return (
    <div className='flex justify-end gap-4' ref={ref}>
      {!usersCurrent ? (
        <>
          <SaveButton />
          {isCompleted ? <CompletedBadge /> : !userHasAnotherStudyplan && <StartButton />}
        </>
      ) : (
        justCompleted && <FinishButton />
      )}
    </div>
  )
}
