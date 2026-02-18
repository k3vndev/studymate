import { useUserStudyplan } from '@/hooks/useUserStudyplan'
import { StudyplanContext } from '@/lib/context/StudyplanContext'
import { showAlert } from '@/lib/utils/showAlert'
import { DropdownMenu } from '@@/DropdownMenu/DropdownMenu'
import { Line } from '@@/DropdownMenu/Line'
import { Option } from '@@/DropdownMenu/Option'
import { CloudIcon, ReloadIcon, RocketIcon, TrashIcon } from '@icons'
import { useContext } from 'react'

export const OptionsButton = () => {
  const { usersCurrent, isCompleted, userHasAnotherStudyplan } = useContext(StudyplanContext)
  const { abandonStudyplan, seeOriginalStudyplan, startStudyplan } = useUserStudyplan({ fetchOnAwake: false })

  const handleAbandonStudyplan = () =>
    showAlert({
      message: "You're about to abandon your studyplan. Youre gonna lose all your progress!",
      acceptButton: {
        onClick: abandonStudyplan,
        text: 'Abandon studyplan',
        icon: <TrashIcon />
      }
    })

  const handleRestartStudyplan = () =>
    showAlert({
      message: "You're about to restart your studyplan. Youre gonna lose all your progress!",
      acceptButton: {
        onClick: startStudyplan,
        text: 'Restart studyplan',
        icon: <ReloadIcon />
      }
    })

  const handleStartStudyplan = async () => {
    if (!userHasAnotherStudyplan) {
      await startStudyplan()
      return
    }

    showAlert({
      header: 'Overwite your studyplan?',
      message:
        'You already have an active study plan. Starting a new one will erase all your current progress!',
      acceptButton: {
        onClick: startStudyplan,
        text: 'Overwite studyplan',
        icon: <RocketIcon />
      }
    })
  }

  if (!isCompleted && !userHasAnotherStudyplan && !usersCurrent) {
    return null
  }

  return (
    <DropdownMenu>
      {(userHasAnotherStudyplan || isCompleted) && (
        <Option action={handleStartStudyplan} danger={userHasAnotherStudyplan}>
          <RocketIcon />
          {isCompleted ? 'Start studyplan again' : 'Start studyplan'}
        </Option>
      )}

      {usersCurrent && (
        <>
          <Option action={seeOriginalStudyplan}>
            <CloudIcon /> See original
          </Option>

          <Line />

          <Option danger action={handleRestartStudyplan}>
            <ReloadIcon /> Restart studyplan
          </Option>

          <Option danger action={handleAbandonStudyplan}>
            <TrashIcon /> Abandon studyplan
          </Option>
        </>
      )}
    </DropdownMenu>
  )
}
