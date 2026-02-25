import { SCREENS } from '@consts'
import { GalleryStudyplansContext } from '@context/GalleryStudyplansContext'
import { useResponsiveness } from '@hooks/useResponsiveness'
import { repeat } from '@utils/repeat'
import { useContext } from 'react'
import { TileStudyplan } from './TileStudyplan'
import { TileStudyPlanFallback } from './TileStudyplanFallback'

export const RowsGalleryStudyplans = () => {
  const { studyplansList, gap } = useContext(GalleryStudyplansContext)
  const { screenSize } = useResponsiveness()

  const itemsCount = screenSize.x >= SCREENS.MD ? 6 : 4
  const slicedStudyplans = studyplansList?.slice(0, itemsCount)

  return (
    <ul className='grid md:grid-cols-3 grid-cols-2' style={{ gap: `${gap}px` }}>
      {slicedStudyplans
        ? slicedStudyplans.map(id => <TileStudyplan key={id} id={id} />)
        : repeat(itemsCount, i => <TileStudyPlanFallback key={i} />)}
    </ul>
  )
}
