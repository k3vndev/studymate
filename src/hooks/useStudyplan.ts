import { useStudyplansStore } from '@store/useStudyplansStore'
import { useUserStore } from '@store/useUserStore'
import type { StudyplanUnion } from '@types'
import { useEffect, useMemo } from 'react'
import { useUserData } from './useUserData'
import { useUserStudyplan } from './useUserStudyplan'

interface Params {
  studyplan: StudyplanUnion
  usersCurrent: boolean
}

export const useStudyplan = ({ studyplan, usersCurrent }: Params) => {
  const { completed } = useUserStore(s => s.studyplansLists)
  const { lists } = useUserData()
  const userStudyplan = useUserStudyplan()

  const setStateStudyplan = useStudyplansStore(s => s.setStudyplan)
  useEffect(() => setStateStudyplan(studyplan), [])

  // Set variables for context
  const isCompleted = useMemo(
    () => !!completed?.some(id => 'id' in studyplan && id === studyplan.id),
    [completed]
  )
  const readyToComplete = userStudyplan.studyplanIsCompleted && usersCurrent

  const publicId = useMemo(() => {
    if ('id' in studyplan) return studyplan.id
    if ('original_id' in studyplan) return studyplan.original_id
    return null
  }, [studyplan])

  const userHasAnotherStudyplan = useMemo(
    () => !!userStudyplan.userStudyplan && !usersCurrent,
    [userStudyplan, usersCurrent]
  )

  const isSaved = useMemo(() => {
    if (!publicId || !lists?.saved) return false
    return lists.saved.some(id => id === publicId)
  }, [publicId, lists])

  return {
    context: {
      studyplan,
      usersCurrent,

      isCompleted,
      readyToComplete,
      publicId,
      userHasAnotherStudyplan,
      isSaved
    },
    userStudyplan
  }
}
