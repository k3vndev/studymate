import { CardStudyplan } from '@/components/Studyplan/CardStudyplan'
import { CardMate } from '@@/CardMate'
import { ChipButton } from '@@/ChipButton'
import { FallbackBox } from '@@/FallbackBox'
import { MagicWandIcon } from '@@/icons'
import { MATE_MESSAGES } from '@consts'
import { useUserPrompts } from '@hooks/useUserPrompts'
import { useUserStudyplan } from '@hooks/useUserStudyplan'

export const InitialSection = () => {
  const prompts = useUserPrompts()
  const { userStudyplan, isLoading } = useUserStudyplan()

  if (isLoading) {
    return <FallbackBox className='max-w-[32rem] h-40' />
  }

  if (userStudyplan) {
    return <CardStudyplan className='max-w-[32rem] w-full' studyplan={userStudyplan} userCurrent />
  }

  return (
    <CardMate message={MATE_MESSAGES.MEET} className={{ main: 'animate-fade-in-fast' }}>
      <ChipButton empty onClick={prompts.whatCanYouDo}>
        <MagicWandIcon />
        What can you do?
      </ChipButton>
    </CardMate>
  )
}
