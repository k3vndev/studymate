import { CardStudyplan } from '@/components/CardStudyplan'
import { useUserStore } from '@/store/useUserStore'
import type { ChatStudyplan } from '@types'
import { useMemo } from 'react'

interface Props {
  studyplan: ChatStudyplan
}

export const StudyplanMessage = ({ studyplan }: Props) => {
  const userStudyplan = useUserStore(s => s.studyplan)

  const isUsersCurrent = useMemo(() => {
    console.log('User original id', userStudyplan?.original_id, 'Current original id', studyplan.original_id)

    if (!userStudyplan?.original_id) return false
    return studyplan.original_id === userStudyplan.original_id
  }, [studyplan.original_id, userStudyplan?.original_id])

  return (
    <CardStudyplan
      className='md:max-w-[22rem] max-w-[20rem] w-full'
      studyplan={studyplan}
      userCurrent={isUsersCurrent}
      inChat
    />
  )
}
