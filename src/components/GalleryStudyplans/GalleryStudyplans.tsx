'use client'

import { useUserData } from '@/hooks/useUserData'
import { GalleryStudyplansContext } from '@/lib/context/GalleryStudyplansContext'
import { dataFetch } from '@/lib/utils/dataFetch'
import { useStudyplansStore } from '@/store/useStudyplansStore'
import type { UserStore } from '@/store/useUserStore'
import { Header } from '@components/Header'
import { CONTENT_JSON } from '@consts'
import type { StudyplanSaved } from '@types'
import { useContext, useEffect } from 'react'
import { CarouselGalleryStudyplans } from './CarouselGalleryStudyplans'
import { EmptyGalleryStudyplans } from './EmptyGalleryStudyplans'
import { RowsGalleryStudyplans } from './RowsGalleryStudyplans'

interface Props {
  title: string
  storeKey: keyof UserStore['studyplansLists']
  carousel?: boolean
  emptyMessage?: string
}

/**
 * A component that renders a gallery of studyplans.
 *
 * It already handles the fetching of the studyplans data from the server.
 *
 * It allows to render the studyplans in a carousel or in a 2 rows layout.
 *
 * @param {Props} props - The props for the GalleryStudyplans component.
 * @param {string} props.title - The title of the gallery.
 * @param {keyof UserStore['studyplansLists']} props.storeKey - The key of the studyplans list in the user store.
 * @param {boolean} [props.carousel=false] - Whether to render the studyplans in a carousel or not.
 * @param {string} [props.emptyMessage='No studyplans found'] - The message to display when the studyplans list is empty.
 */
export const GalleryStudyplans = ({
  title,
  storeKey,
  carousel = false,
  emptyMessage = 'No studyplans found'
}: Props) => {
  const addStudyplans = useStudyplansStore(s => s.addStudyplans)
  const { lists: studyplansLists } = useUserData()

  const studyplansList = studyplansLists[storeKey]
  const gap = 16

  useEffect(() => {
    if (!studyplansList) return

    dataFetch<StudyplanSaved[]>({
      url: '/api/studyplans',
      options: {
        method: 'POST',
        headers: CONTENT_JSON,
        body: JSON.stringify(studyplansList)
      },
      onSuccess: data => addStudyplans(...data)
    })
  }, [studyplansList])

  const isEmpty = studyplansList?.length === 0

  return (
    <GalleryStudyplansContext.Provider value={{ studyplansList, carousel, gap, emptyMessage, title }}>
      <section className='flex flex-col animate-fade-in-fast' style={{ gap: `${gap}px` }}>
        <GalleryHeader />

        {isEmpty ? (
          <EmptyGalleryStudyplans />
        ) : carousel ? (
          <CarouselGalleryStudyplans />
        ) : (
          <RowsGalleryStudyplans />
        )}
      </section>
    </GalleryStudyplansContext.Provider>
  )
}

const GalleryHeader = () => {
  const { title, studyplansList } = useContext(GalleryStudyplansContext)

  return studyplansList ? (
    <Header>{title}</Header>
  ) : (
    <div className='bg-zinc-700 animate-pulse rounded-lg w-48 h-8' />
  )
}
