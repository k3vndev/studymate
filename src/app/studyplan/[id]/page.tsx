'use client'

import { dataFetch } from '@/lib/utils/dataFetch'
import { useStudyplansStore } from '@/store/useStudyplansStore'
import { Button, ErrorCard, Gigant, Message } from '@components/ErrorCard'
import { Loadable } from '@components/Loadable'
import { Main } from '@components/Main'
import { Sidebar } from '@components/Sidebar'
import { Studyplan } from '@components/Studyplan/Studyplan'
import { ArrowIcon } from '@components/icons'
import { CONTENT_JSON } from '@consts'
import { useSearchStudyplan } from '@hooks/useSearchStudyplan'
import { useUserData } from '@hooks/useUserData'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { PublicStudyplan } from '@types'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PublicStudyplanPage() {
  const studyplan = useStudyplansStore(s => s.studyplan)
  const setStateStudyplan = useStudyplansStore(s => s.setStudyplan)
  const addStudyplans = useStudyplansStore(s => s.addStudyplans)
  const [hasSession, setHasSession] = useState<boolean | undefined>(undefined)

  const [isOnError, setIsOnError] = useState(false)

  const { id } = useParams()
  const router = useRouter()

  const { searchStudyplan } = useSearchStudyplan()
  useUserData()

  const checkSession = async () => {
    const {
      data: { session }
    } = await createClientComponentClient().auth.getSession()

    setHasSession(session !== null)
  }

  const handleStudyplanLoad = () => {
    // Don't proceed if the id is not a string and redirect to the dashboard if the studyplan is null
    if (typeof id !== 'string') {
      if (studyplan === null) router.push('./dashboard')
      return
    }

    // If the studyplan is null or the id is not the same as the studyplan id, search for the studyplan
    if (studyplan === null || (studyplan as PublicStudyplan)?.id !== id) {
      const foundStudyplan = searchStudyplan(id)

      if (foundStudyplan) {
        setStateStudyplan(foundStudyplan)
        return
      }
    } else if ((studyplan as PublicStudyplan)?.id === id) {
      return
    }

    // If the studyplan wasn't already loaded, fetch it
    setStateStudyplan(null)

    dataFetch<PublicStudyplan[]>({
      url: '/api/studyplans',
      options: { method: 'POST', headers: CONTENT_JSON, body: JSON.stringify([id]) },
      onSuccess: data => {
        if (data.length === 0) {
          setIsOnError(true)
          return
        }
        const [studyplan] = data
        setStateStudyplan(studyplan)
        addStudyplans(studyplan)
      },
      onError: () => setIsOnError(true)
    })
  }

  useEffect(() => {
    // Redirect to the tasks page if the id is a typo
    const typoRoutes = ['task', 'lesson', 'lessons']
    if (typoRoutes.includes(id as string)) {
      router.replace('/studyplan/tasks')
      return
    }

    checkSession()
    handleStudyplanLoad()
  }, [])

  const justifySelf = !hasSession ? 'justify-self-center xl:justify-self-center' : ''

  const backToDashboard = () => router.replace('/dashboard')

  if (hasSession === undefined) {
    return null
  }

  return (
    <>
      <Main className={`${justifySelf} gap-12 h-full relative`}>
        {!isOnError ? (
          <Loadable isLoading={!studyplan}>{studyplan && <Studyplan {...{ studyplan }} />}</Loadable>
        ) : (
          <ErrorCard className='self-center'>
            <Gigant>Uh oh... 404</Gigant>
            <Message>That studyplan doesn't exist</Message>
            <Button onClick={backToDashboard}>
              <ArrowIcon className='rotate-90 group-active:-translate-x-1.5 transition size-6 min-w-6' />
              Go to dashboard
            </Button>
          </ErrorCard>
        )}
      </Main>

      {hasSession && <Sidebar />}
    </>
  )
}
