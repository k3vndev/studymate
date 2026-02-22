import type { DBUserData, StudySession, UserStudyplan } from '@types'
import { create } from 'zustand'
import { type ValueOrCallback, setState } from './utils/setState'

export interface UserStore {
  hydrated: boolean
  setHydrated: (hydrated: boolean) => void

  profileData: DBUserData | null
  setProfileData: (value: DBUserData | null) => void

  studyplan: UserStudyplan | null | undefined
  setStudyplan: (studyplan: UserStudyplan | null) => void

  isLoadingData: boolean
  setIsLoadingData: (isLoading: boolean) => void

  setTaskDone: (index: number, value: string, currentDay: number) => void

  studyplansLists: {
    recommended?: string[]
    completed?: string[]
    saved?: string[]
  }
  setStudyplansLists: (
    callback: (studyplans: UserStore['studyplansLists']) => UserStore['studyplansLists']
  ) => void

  modifyStudyplansList: (
    modifyId: string,
    listKey: keyof UserStore['studyplansLists']
  ) => {
    add: (placeAtStart?: boolean) => void
    remove: () => void
  }

  secondsFocusedToday: number | null
  setSecondsFocusedToday: (state: ValueOrCallback<number | null>) => void

  userStudySessions: StudySession[] | null
  setUserStudySessions: (state: ValueOrCallback<StudySession[] | null>) => void
}

export const useUserStore = create<UserStore>(set => ({
  hydrated: false,
  setHydrated: hydrated => set(() => ({ hydrated })),

  profileData: null,
  setProfileData: value => set(() => ({ profileData: value })),

  studyplan: undefined,
  setStudyplan: value => set(() => ({ studyplan: value })),

  isLoadingData: false,
  setIsLoadingData: isLoading => set(() => ({ isLoadingData: isLoading })),

  setTaskDone: (index, value, currentDay) =>
    set(({ studyplan }) => {
      const newStudyplan = structuredClone(studyplan)
      if (!newStudyplan) return {}

      newStudyplan.daily_lessons[currentDay - 1].tasks[index].completed_at = value
      return { studyplan: newStudyplan }
    }),

  studyplansLists: {},

  setStudyplansLists: callback =>
    set(({ studyplansLists: studyplans }) => {
      return { studyplansLists: callback({ ...studyplans }) }
    }),

  modifyStudyplansList: (id, key) => {
    const getValues = (ogLists: UserStore['studyplansLists']) => {
      const lists = { ...ogLists }
      const list = lists[key]
      const index = list?.findIndex(listId => listId === id) ?? -1
      return { lists, list, index }
    }

    return {
      add: (placeAtStart = false) =>
        set(({ studyplansLists }) => {
          const { lists, list, index } = getValues(studyplansLists)
          if (!list || index !== -1) return {}

          // Add id to the start or the end of the list
          if (placeAtStart) list.unshift(id)
          else list.push(id)

          lists[key] = list
          return { studyplansLists: lists }
        }),
      remove: () =>
        set(({ studyplansLists }) => {
          const { lists, list, index } = getValues(studyplansLists)
          if (!list || index === -1) return {}

          // Remove id from the list
          list.splice(index, 1)

          lists[key] = list
          return { studyplansLists: lists }
        })
    }
  },

  secondsFocusedToday: null,
  setSecondsFocusedToday: state => set(s => setState(s, 'secondsFocusedToday', state, value => value)),

  userStudySessions: null,
  setUserStudySessions: state => set(s => setState(s, 'userStudySessions', state, value => value))
}))
