import { useStudyplansStore } from '@/store/useStudyplansStore'
import { useUserStore } from '@/store/useUserStore'
import type { StudyplanUnion } from '@types'
import { use, useEffect, useMemo, useState } from 'react'
import { useUserData } from './useUserData'
import { useUserStudyplan } from './useUserStudyplan'

interface Params {
  studyplan: StudyplanUnion
  usersCurrent: boolean
}

export const useStudyplan = ({ studyplan, usersCurrent }: Params) => {
  const { completed } = useUserStore(s => s.studyplansLists)
  const { lists } = useUserData()
  const [isLoadingUserData, setIsLoadingUserData] = useState(true)

  const userStudyplan = useUserStudyplan()

  const setStateStudyplan = useStudyplansStore(s => s.setStudyplan)
  useEffect(() => setStateStudyplan(studyplan), [])

  // Handle isLoadingUserData value
  useEffect(() => {
    if (isLoadingUserData) {
      const objList = Object.entries(lists)
      const userListsWereLoaded = objList.every(l => l[1])

      if (userListsWereLoaded && !userStudyplan.isLoading) {
        setIsLoadingUserData(false)
      }
    }
  }, [lists, userStudyplan.isLoading])

  // Set variables for context
  const isCompleted = useMemo(
    () => !!completed?.some(id => 'id' in studyplan && id === studyplan.id),
    [completed]
  )
  const readyToComplete = userStudyplan.areTodaysTasksAllDone && usersCurrent

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
      isLoadingUserData,

      isCompleted,
      readyToComplete,
      publicId,
      userHasAnotherStudyplan,
      isSaved
    },
    userStudyplan
  }
}
