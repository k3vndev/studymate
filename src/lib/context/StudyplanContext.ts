import type { StudyplanUnion } from '@types'
import { createContext } from 'react'

interface StudyplanContext {
  studyplan: StudyplanUnion
  isLoadingUserData: boolean
  usersCurrent: boolean
  isCompleted: boolean
  userHasAnotherStudyplan: boolean
  readyToComplete: boolean
  isSaved: boolean
  publicId: string | null
}

export const StudyplanContext = createContext<StudyplanContext>({
  studyplan: undefined as any,
  isLoadingUserData: true,
  usersCurrent: false,
  isCompleted: false,
  userHasAnotherStudyplan: false,
  readyToComplete: false,
  isSaved: false,
  publicId: null
})
