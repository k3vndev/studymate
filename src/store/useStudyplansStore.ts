import type { BaseStudyplan, ChatStudyplan, PublicStudyplan, UserStudyplan } from '@types'
import { create } from 'zustand'

export interface StudyplansStore {
  studyplan: PublicStudyplan | BaseStudyplan | UserStudyplan | ChatStudyplan | null
  setStudyplan: (value: StudyplansStore['studyplan']) => void

  studyplans: PublicStudyplan[]
  addStudyplans: (...values: PublicStudyplan[]) => void
}

export const useStudyplansStore = create<StudyplansStore>(set => ({
  studyplan: null,
  setStudyplan: value => set(() => ({ studyplan: value })),

  studyplans: [],

  addStudyplans: (...newStudyplans) =>
    set(({ studyplans }) => {
      const clonedStudyplans = structuredClone(studyplans)

      newStudyplans.forEach(addingStudyplan => {
        if (!clonedStudyplans.some(({ id }) => id === addingStudyplan.id)) {
          clonedStudyplans.push(addingStudyplan)
        }
      })
      return { studyplans: clonedStudyplans }
    })
}))
