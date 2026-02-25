import { CardMate } from '@@/CardMate'
import { ChipButton } from '@@/ChipButton'
import { MATE_MESSAGES } from '@consts'
import { useUserPrompts } from '@hooks/useUserPrompts'
import { MagicWandIcon } from '@icons'
import { Input } from '../Input'

export const NoMessagesScreen = () => {
  const prompt = useUserPrompts()

  return (
    <div className='h-full flex flex-col justify-center gap-4'>
      <CardMate message={MATE_MESSAGES.MEET}>
        <ChipButton onClick={prompt.createStudyplan} empty>
          <MagicWandIcon />
          Create a studyplan
        </ChipButton>
      </CardMate>

      <Input />
    </div>
  )
}
