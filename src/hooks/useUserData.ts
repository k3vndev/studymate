import { dataFetch } from '@/lib/utils/dataFetch'
import { useUserStore } from '@/store/useUserStore'
import type { DBStudyplansLists, DBUserData, StudySession } from '@types'
import { useEffect } from 'react'

/**
 * Custom hook to fetch user data for the first time and provide it to components.
 */
export const useUserData = () => {
  const studyplansLists = useUserStore(s => s.studyplansLists)
  const setStudyplansLists = useUserStore(s => s.setStudyplansLists)

  const profileData = useUserStore(s => s.profileData)
  const setProfileData = useUserStore(s => s.setProfileData)

  const setIsLoadingData = useUserStore(s => s.setIsLoadingData)
  const isLoadingData = useUserStore(s => s.isLoadingData)

  const userStudySessions = useUserStore(s => s.userStudySessions)
  const setUserStudySessions = useUserStore(s => s.setUserStudySessions)

  const hydrated = useUserStore(s => s.hydrated)
  const setHydrated = useUserStore(s => s.setHydrated)

  useEffect(() => {
    if (hydrated || isLoadingData) {
      // Do not proceed if the store is already hydrated or data is loading
      return
    }

    setIsLoadingData(true)

    Promise.all([
      // Fetch the lists from the API
      dataFetch<DBStudyplansLists['studyplans_lists']>({
        url: '/api/user/lists',
        onSuccess: data => setStudyplansLists(() => data)
      }),

      // Fetch the basic user data (id, user_name, avatar_url...) from the API
      dataFetch<DBUserData>({
        url: '/api/user/profile',
        onSuccess: data => setProfileData(data)
      }),

      // Fetch all user study sessions statistics
      dataFetch<StudySession[]>({
        url: '/api/study_sessions',
        onSuccess: data => setUserStudySessions(data)
      })
    ])
      // Stop loading data when the process stops
      .finally(() => {
        setIsLoadingData(false)
        setHydrated(true)
      })
  }, [hydrated, isLoadingData])

  return { lists: studyplansLists, profile: profileData, studySessions: userStudySessions }
}
