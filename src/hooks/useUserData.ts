import { dataFetch } from '@/lib/utils/dataFetch'
import { useUserStore } from '@/store/useUserStore'
import type { DBStudyplansLists, DBUserData, StudySession } from '@types'
import { useEffect } from 'react'

/**
 * Custom hook to fetch user data for the first time and provide it to components.
 */
export const useUserData = () => {
  const s = useUserStore()

  useEffect(() => {
    if (s.hydrated || s.isLoadingData) {
      // Do not proceed if the store is already hydrated or data is loading
      return
    }

    s.setIsLoadingData(true)

    Promise.all([
      // Fetch the lists from the API
      dataFetch<DBStudyplansLists['studyplans_lists']>({
        url: '/api/user/lists',
        onSuccess: data => s.setStudyplansLists(() => data)
      }),

      // Fetch the basic user data (id, user_name, avatar_url...) from the API
      dataFetch<DBUserData>({
        url: '/api/user/profile',
        onSuccess: data => s.setProfileData(data)
      }),

      // Fetch all user study sessions statistics
      dataFetch<StudySession[]>({
        url: '/api/study_sessions',
        onSuccess: data => s.setUserStudySessions(data)
      })
    ])
      // Stop loading data when the process stops
      .finally(() => {
        s.setIsLoadingData(false)
        s.setHydrated(true)
      })
  }, [s.hydrated, s.isLoadingData])

  /**
   * Function to clean user data from the store, used for logout.
   */
  const cleanUserData = () => {
    s.setStudyplansLists({})
    s.setProfileData(null)
    s.setUserStudySessions([])
    s.setHydrated(false)
    s.setIsLoadingData(false)
    s.setUserStudySessions(null)
    s.setSecondsFocusedToday(null)
  }

  return {
    lists: s.studyplansLists,
    profile: s.profileData,
    studySessions: s.userStudySessions,
    cleanUserData
  }
}
