import { SCREENS } from '@consts'
import { GalleryStudyplansContext } from '@context/GalleryStudyplansContext'
import { useResponsiveness } from '@hooks/useResponsiveness'
import { repeat } from '@utils/repeat'
import { useContext, useMemo, useRef } from 'react'
import { CarouselButtons } from './CarouselButtons'
import { TileStudyplan } from './TileStudyplan'
import { TileStudyPlanFallback } from './TileStudyplanFallback'

export const CarouselGalleryStudyplans = () => {
  const { studyplansList, gap } = useContext(GalleryStudyplansContext)
  const { screenSize, loaded } = useResponsiveness()

  const ulRef = useRef<HTMLUListElement>(null)

  const showItemsCount = screenSize.x >= SCREENS.MD ? 3 : 2

  // Calculate the width of the tile based on the screen size
  const tileWidth = useMemo(() => {
    if (!ulRef.current || !loaded) return
    const { offsetWidth } = ulRef.current
    const totalGap = gap * (showItemsCount - 1)
    return (offsetWidth - totalGap) / showItemsCount
  }, [screenSize.x, loaded])

  const tileProps = {
    className: 'shrink-0 snap-start',
    style: {
      width: `${tileWidth}px`,
      maxWidth: `${tileWidth}px`,
      minWidth: `${tileWidth}px`
    }
  }

  return (
    <div className='relative'>
      <ul
        ref={ulRef}
        className='flex overflow-x-scroll w-full max-w-full scrollbar-hide snap-x snap-mandatory rounded-lg'
        style={{
          contain: 'layout inline-size',
          gap: `${gap}px`
        }}
      >
        {loaded &&
          (tileWidth && studyplansList
            ? studyplansList.map(id => <TileStudyplan key={id} id={id} {...tileProps} inCarousel />)
            : repeat(showItemsCount, i => <TileStudyPlanFallback key={i} {...tileProps} />))}
      </ul>

      {studyplansList && <CarouselButtons {...{ ulRef, showItemsCount, tileWidth }} />}
    </div>
  )
}
