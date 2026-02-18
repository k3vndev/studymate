import { useUserBehavior } from '@/hooks/useUserBehavior'
import { BaseStudyplanSchema } from '@/lib/schemas/Studyplan'
import { dataFetch } from '@/lib/utils/dataFetch'
import { type EvaluateUserStudyplanReturn, evaluateUserStudyplan } from '@/lib/utils/evaluateUserStudyplan'
import { saveChatToDatabase } from '@/lib/utils/saveChatToDatabase'
import { throwConfetti } from '@/lib/utils/throwConfetti'
import { useChatStore } from '@/store/useChatStore'
import { useStudyplansStore } from '@/store/useStudyplansStore'
import { useUserStore } from '@/store/useUserStore'
import { CONTENT_JSON } from '@consts'
import type { PublicStudyplan, StartStudyplanReqBody, UserStudyplan } from '@types'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'

interface Params {
  fetchOnAwake?: boolean
  redirectTo?: string
}

export const useUserStudyplan = (params?: Params) => {
  const userStudyplan = useUserStore(s => s.studyplan)
  const setUserStudyplan = useUserStore(s => s.setStudyplan)
  const modifyStudyplansList = useUserStore(s => s.modifyStudyplansList)
  const stateStudyplan = useStudyplansStore(s => s.studyplan)
  const setChatStudyplanOriginalId = useChatStore(s => s.setStudyplanOriginalId)

  const onUser = useUserBehavior()
  const router = useRouter()

  // Initial fetch of user's Studyplan
  useEffect(() => {
    const fetchOnAwake = params?.fetchOnAwake ?? true
    if (userStudyplan !== undefined || !fetchOnAwake) return

    dataFetch<UserStudyplan | null>({
      url: '/api/user/studyplan',
      onSuccess: data => setUserStudyplan(data),
      onError: () => setUserStudyplan(null)
    })
  }, [])

  // Redirect the user in case there's no Studyplan
  useEffect(() => {
    if (userStudyplan === null && params?.redirectTo) {
      router.replace(params.redirectTo)
    }
  }, [userStudyplan])

  const utilityValues: EvaluateUserStudyplanReturn = useMemo(() => {
    try {
      if (userStudyplan) {
        console.log(userStudyplan)
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        return evaluateUserStudyplan(userStudyplan, timezone)
      }
      throw new Error()
    } catch {
      return {
        todaysTasks: [],
        isOnLastDay: false,
        currentDay: 0,
        studyplanIsCompleted: false,
        areTodaysTasksAllDone: false
      }
    }
  }, [userStudyplan])

  const start = () => {
    // Don't start the Studyplan if its null or not valid
    const { data, success } = BaseStudyplanSchema.safeParse(stateStudyplan)
    if (!success || data === null) return

    // If the stateStudyplan is already a PublicStudyplan, we can just use its id to start it. Otherwise, send the whole object to the API to create a new UserStudyplan based on it.
    const requestBody: StartStudyplanReqBody = (stateStudyplan as PublicStudyplan)?.id ?? data

    return dataFetchHandler<UserStudyplan>({
      url: '/api/user/studyplan',
      options: {
        method: 'POST',
        headers: CONTENT_JSON,
        body: JSON.stringify(requestBody)
      },
      onSuccess: newStudyplan => {
        // Set the new studyplan as the user's current
        setUserStudyplan(newStudyplan)

        if (stateStudyplan && 'chat_message_id' in stateStudyplan && stateStudyplan.chat_message_id) {
          // Set the original_id in the state studyplan
          setChatStudyplanOriginalId(stateStudyplan.chat_message_id, newStudyplan.original_id, newMessages =>
            saveChatToDatabase(newMessages)
          )
        }

        // Go to the new studyplan page
        onUser({ stayed: () => router.replace('/studyplan') })
      }
    })
  }

  const abandon = () =>
    dataFetchHandler({
      url: '/api/user/studyplan',
      options: { method: 'DELETE' },
      onSuccess: () =>
        onUser({
          stayed: () => seeOriginal('replace'),
          gone: () => setUserStudyplan(null)
        })
    })

  const finish = () =>
    dataFetchHandler<string>({
      url: '/api/user/studyplan',
      options: { method: 'PUT' },
      onSuccess: id =>
        onUser({
          stayed: () => seeOriginal('replace'),
          stayedWaitTime: throwConfetti,
          gone: () => {
            setUserStudyplan(null)
            modifyStudyplansList(id, 'completed').add()
          }
        })
    })

  const seeOriginal = (method: keyof AppRouterInstance = 'push') => {
    if (userStudyplan) {
      const { original_id } = userStudyplan
      router[method](`/studyplan/${original_id}`)
    }
  }

  return {
    userStudyplan: userStudyplan ?? null,
    isLoading: userStudyplan === undefined,
    ...utilityValues,

    startStudyplan: start,
    abandonStudyplan: abandon,
    finishStudyplan: finish,
    seeOriginalStudyplan: seeOriginal
  }
}

interface DataFetchHandlerParams<T> {
  url: string
  options?: RequestInit
  onSuccess?: (data: T) => void
}

const dataFetchHandler = <T>({ url, options, onSuccess }: DataFetchHandlerParams<T>) =>
  new Promise<void>(res => {
    dataFetch<T>({ url, options, onSuccess, onFinish: res, redirectOn401: true })
  })
