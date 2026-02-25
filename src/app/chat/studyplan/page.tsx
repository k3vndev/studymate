'use client'

import { Main } from '@@/Main'
import { Studyplan } from '@@/Studyplan/Studyplan'
import { useStudyplansStore } from '@store/useStudyplansStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ChatStudyplanPage() {
  const studyplan = useStudyplansStore(s => s.studyplan)
  const router = useRouter()

  useEffect(() => {
    if (studyplan === null) {
      router.push('/chat')
    }
  }, [])

  return (
    <Main className='gap-12 h-full relative'>
      {studyplan !== null ? <Studyplan {...{ studyplan }} /> : null}
    </Main>
  )
}
