import { BaseStudyplanSchema } from '@/lib/schemas/Studyplan'
import { dataFetch } from '@/lib/utils/dataFetch'
import { type EvaluateUserStudyplanReturn, evaluateUserStudyplan } from '@/lib/utils/evaluateUserStudyplan'
import { saveChatToDatabase } from '@/lib/utils/saveChatToDatabase'
import { throwConfetti } from '@/lib/utils/throwConfetti'
import { useChatStore } from '@/store/useChatStore'
import { useStudyplansStore } from '@/store/useStudyplansStore'
import { useUserStore } from '@/store/useUserStore'
import { CONTENT_JSON } from '@consts'
import { useUserBehavior } from '@hooks/useUserBehavior'
import type { BaseStudyplan, PublicStudyplan, StartStudyplanReqBody, UserStudyplan } from '@types'
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

  const setChatStudyplanOriginalId = useChatStore(s => s.setStudyplanOriginalId)
  const setThrowConfettiNextTime = useStudyplansStore(s => s.setThrowConfettiNextTime)
  const modifyStudyplansList = useUserStore(s => s.modifyStudyplansList)

  const stateStudyplan = useStudyplansStore(s => s.studyplan)
  const setStateStudyplan = useStudyplansStore(s => s.setStudyplan)

  const onUser = useUserBehavior()
  const router = useRouter()

  // Initial fetch of user's Studyplan
  useEffect(() => {
    const fetchOnAwake = params?.fetchOnAwake ?? true

    if (userStudyplan === undefined && fetchOnAwake) {
      dataFetch<UserStudyplan | null>({
        url: '/api/user/studyplan',
        onSuccess: data => setUserStudyplan(data),
        onError: () => setUserStudyplan(null)
      })
    }
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
    if (!stateStudyplan) throw new Error('No studyplan in state to start')

    // First try to get an id or original_id from the state studyplan
    let requestBody: StartStudyplanReqBody | undefined =
      (stateStudyplan as PublicStudyplan)?.id ?? (stateStudyplan as UserStudyplan)?.original_id

    // If we didn't get an id, send the whole studyplan object (if it exists in the state)
    if (!requestBody) {
      const { data, success } = BaseStudyplanSchema.safeParse(stateStudyplan)
      if (!success || data === null) throw new Error('Invalid studyplan')
      requestBody = data
    }

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
          const { chat_message_id, original_id } = stateStudyplan
          setChatStudyplanOriginalId(chat_message_id, original_id!, newMessages =>
            saveChatToDatabase(newMessages)
          )
        }

        // Go to the new studyplan page
        onUser({ stayed: () => router.push('/studyplan') })
      }
    })
  }

  const abandon = () =>
    dataFetchHandler({
      url: '/api/user/studyplan',
      options: { method: 'DELETE' },
      onSuccess: () =>
        onUser({
          stayedWaitTime: () => seeOriginal({ method: 'replace' }),
          gone: () => setUserStudyplan(null)
        })
    })

  const finish = () =>
    dataFetchHandler<string>({
      url: '/api/user/studyplan',
      options: { method: 'PUT' },
      onSuccess: id => {
        seeOriginal({ method: 'replace' })
        setThrowConfettiNextTime(true)

        modifyStudyplansList(id, 'completed').add()
        onUser({ gone: () => setUserStudyplan(null) })
      }
    })

  const seeOriginal = (params?: { method?: keyof AppRouterInstance }) => {
    const { method = 'push' } = params ?? {}

    if (userStudyplan) {
      const { original_id } = userStudyplan
      setStateStudyplan(null)
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
  new Promise<void>((res, rej) => {
    dataFetch<T>({
      url,
      options,
      onSuccess: data => {
        onSuccess?.(data)
        res()
      },
      onError: () => rej(),
      redirectOn401: true
    })
  })
