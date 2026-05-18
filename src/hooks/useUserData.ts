import { useChatStore } from '@store/useChatStore'
import { useUserStore } from '@store/useUserStore'
import type { DBStudyplansLists, DBUserData, StudySession } from '@types'
import { dataFetch } from '@utils/dataFetch'
import { useEffect, useMemo, useRef } from 'react'

/**
 * Custom hook to fetch user data for the first time and provide it to components.
 */
export const useUserData = () => {
  const userStore = useUserStore()
  const setMessages = useChatStore(s => s.setMessages)
  const thisLoadingIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!userStore.hydrated && !userStore.loadingDataId) {
      // Generate a random loading ID
      thisLoadingIdRef.current = Math.random().toString(36).substring(2)
      userStore.setLoadingDataId(thisLoadingIdRef.current)
    }
  }, [userStore.hydrated, userStore.loadingDataId])

  // Fetch data once userStore.setLoadingDataId is set
  useEffect(() => {
    if (!userStore.loadingDataId || userStore.loadingDataId !== thisLoadingIdRef.current) {
      // Do not proceed if loadingDataId is not set or does not match this instance's loading ID
      return
    }

    Promise.all([
      // Fetch the lists from the API
      dataFetch<DBStudyplansLists['studyplans_lists']>({
        url: '/api/user/lists',
        onSuccess: data => userStore.setStudyplansLists(() => data)
      }),

      // Fetch the basic user data (id, user_name, avatar_url...) from the API
      dataFetch<DBUserData>({
        url: '/api/user/profile',
        onSuccess: data => userStore.setProfileData(data)
      }),

      // Fetch all user study sessions statistics
      dataFetch<StudySession[]>({
        url: '/api/study_sessions',
        onSuccess: data => userStore.setStudySessions(data)
      })
    ])
      // Stop loading data when the process stops
      .finally(() => {
        userStore.setLoadingDataId(null)
        userStore.setHydrated(true)
      })
  }, [userStore.loadingDataId])

  /**
   * Clean user data from the store, used for logout.
   */
  const cleanUserData = () => {
    userStore.setStudyplansLists({})
    userStore.setProfileData(null)
    userStore.setStudySessions([])
    userStore.setHydrated(false)
    userStore.setStudySessions(null)
    userStore.setSecondsFocusedToday(null)
    userStore.setStudyplan(null)

    if (thisLoadingIdRef.current === userStore.loadingDataId) {
      // Only clean if we know its the same id
      userStore.setLoadingDataId(null)
    }

    setMessages(null)
  }

  /**
   * Memoized value to determine if the user is logged in based on the presence of profile data and hydration status.
   * If the store is not hydrated yet, it will return undefined. Once the store is hydrated, it will return true if profileData is not null, and false otherwise.
   */
  const isLoggedIn = useMemo(
    () => (!userStore.hydrated ? undefined : userStore.profileData !== null),
    [userStore.hydrated, userStore.profileData]
  )

  return {
    lists: userStore.studyplansLists,
    profile: userStore.profileData,
    studySessions: userStore.studySessions,
    isLoggedIn,
    cleanUserData
  }
}
