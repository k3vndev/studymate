import { FONTS } from '@consts'
import { useSearchStudyplan } from '@hooks/useSearchStudyplan'
import { ClockIcon } from '@icons'
import { extractCategoryValues } from '@utils/extractCategoryValues'
import { formatDays } from '@utils/formatDays'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { TileStudyPlanFallback } from './TileStudyplanFallback'

interface Props {
  className?: string
  style?: React.CSSProperties
  id: string
  inCarousel?: boolean
}

export const TileStudyplan = ({ id, className = '', style, inCarousel }: Props) => {
  const { studyplan } = useSearchStudyplan(id)
  const elementRef = useRef<HTMLLIElement>(null)
  const initialScroll = useRef(true)

  useEffect(() => {
    if (elementRef.current && initialScroll.current && inCarousel) {
      initialScroll.current = false

      const { parentElement } = elementRef.current
      parentElement?.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }, [elementRef.current])

  if (studyplan) {
    const { name, category, daily_lessons } = studyplan
    const { image } = extractCategoryValues(category)
    const duration = formatDays(daily_lessons.length)

    return (
      <li
        className={twMerge(`
          flex flex-col w-full h-[var(--studyplan-tile-height)] 
          button ${className}
        `)}
        title={name}
        style={style}
      >
        <Link href={`/studyplan/${id}`} className='flex flex-col h-full'>
          <div className='flex-1 w-full rounded-lg overflow-hidden mb-2 relative'>
            <Image
              src={`/studyplan/${image}.webp`}
              alt='Studyplan category'
              fill
              className='object-cover'
              draggable={false}
            />
          </div>
          <span
            className={`
              ${FONTS.POPPINS} text-lg text-white overflow-hidden 
              text-ellipsis whitespace-nowrap h-7 mb-1
            `}
          >
            {name}
          </span>
          <span className='flex items-center gap-1 text-gray-10 -translate-y-1'>
            <ClockIcon className='size-5' />
            {duration}
          </span>
        </Link>
      </li>
    )
  }

  return <TileStudyPlanFallback style={style} />
}
