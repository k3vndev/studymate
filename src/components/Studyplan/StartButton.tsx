import { useUserStudyplan } from '@/hooks/useUserStudyplan'
import { RocketIcon } from '@icons'
import { useState } from 'react'
import { ChipButton } from '../ChipButton'

export const StartButton = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { startStudyplan } = useUserStudyplan()

  const handleStartStudyplan = async () => {
    try {
      setIsLoading(true)
      await startStudyplan()
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <ChipButton onClick={handleStartStudyplan} isLoading={isLoading}>
      <RocketIcon /> Start this studyplan
    </ChipButton>
  )
}
