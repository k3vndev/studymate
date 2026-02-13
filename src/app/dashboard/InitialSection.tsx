import { FallbackBox } from '@/components/FallbackBox'
import { useUserPrompts } from '@/hooks/useUserPrompts'
import { useUserStudyplan } from '@/hooks/useUserStudyplan'
import { CardMate } from '@components/CardMate'
import { CardStudyplan } from '@components/CardStudyplan'
import { ChipButton } from '@components/ChipButton'
import { MagicWandIcon } from '@components/icons'
import { MATE_MESSAGES } from '@consts'

export const InitialSection = () => {
  const prompts = useUserPrompts({ redirect: true })
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
