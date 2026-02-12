import { LoadingIcon } from '@/components/icons'
import { Badge } from '@components/Badge'
import { Header } from '@components/Header'
import { Paragraph } from '@components/Paragraph'
import type { GeneratingStudyplanContent } from '@types'
import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

interface Props {
  content: GeneratingStudyplanContent
  className?: string
}

export const GeneratingStudyplanLoader = ({ content, className = '' }: Props) => {
  const { name, desc, daily_lessons_count } = content
  const intervalRef = useRef<NodeJS.Timeout>()

  const [ellipsisDots, setEllipsisDots] = useState('')

  // Create an interval for the "..." animation while the lessons are being generated
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setEllipsisDots(e => {
        const { length } = e
        const next = length >= 3 ? 0 : length + 1
        return '.'.repeat(next)
      })
    }, 333)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <article
      className={twMerge(`
        w-[22rem] border border-dashed border-card-border bg-card-background animate-pulse
        px-5 py-6 flex flex-col gap-1 rounded-2xl cursor-default relative ${className}
      `)}
    >
      {name ? (
        <>
          <Badge>CREATING STUDYPLAN...</Badge>
          <Header className='mb-1 animate-appear'>{name}</Header>
          {desc && <Paragraph className='animate-appear'>{desc}</Paragraph>}

          <div className='mt-3 flex items-center flex-wrap gap-2 w-full animate-pulse'>
            <LoadingIcon className='animate-spin' />
            {daily_lessons_count !== undefined && (
              <span className='animate-appear'>
                Generating lesson {daily_lessons_count}
                {ellipsisDots}
              </span>
            )}
          </div>
        </>
      ) : (
        <div className='size-full flex flex-col items-center justify-center h-20'>
          <LoadingIcon className='animate-spin size-10' />
        </div>
      )}
    </article>
  )
}
