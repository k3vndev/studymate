import { useChatStore } from '@store/useChatStore'
import { useUserStore } from '@store/useUserStore'
import type { DBStudyplansLists, DBUserData, StudySession } from '@types'
import { dataFetch } from '@utils/dataFetch'
import { useEffect } from 'react'

/**
 * Custom hook to fetch user data for the first time and provide it to components.
 */
export const useUserData = () => {
  const user = useUserStore()
  const setMessages = useChatStore(s => s.setMessages)

  useEffect(() => {
    if (user.hydrated || user.isLoadingData) {
      // Do not proceed if the store is already hydrated or data is loading
      return
    }

    user.setIsLoadingData(true)

    Promise.all([
      // Fetch the lists from the API
      dataFetch<DBStudyplansLists['studyplans_lists']>({
        url: '/api/user/lists',
        onSuccess: data => user.setStudyplansLists(() => data)
      }),

      // Fetch the basic user data (id, user_name, avatar_url...) from the API
      dataFetch<DBUserData>({
        url: '/api/user/profile',
        onSuccess: data => user.setProfileData(data)
      }),

      // Fetch all user study sessions statistics
      dataFetch<StudySession[]>({
        url: '/api/study_sessions',
        onSuccess: data => user.setStudySessions(data)
      })
    ])
      // Stop loading data when the process stops
      .finally(() => {
        user.setIsLoadingData(false)
        user.setHydrated(true)
      })
  }, [user.hydrated, user.isLoadingData])

  /**
   * Function to clean user data from the store, used for logout.
   */
  const cleanUserData = () => {
    user.setStudyplansLists({})
    user.setProfileData(null)
    user.setStudySessions([])
    user.setHydrated(false)
    user.setIsLoadingData(false)
    user.setStudySessions(null)
    user.setSecondsFocusedToday(null)
    user.setStudyplan(null)

    setMessages(null)
  }

  return {
    lists: user.studyplansLists,
    profile: user.profileData,
    studySessions: user.studySessions,
    cleanUserData
  }
}
