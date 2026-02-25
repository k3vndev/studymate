import { GalleryStudyplansContext } from '@context/GalleryStudyplansContext'
import { useContext } from 'react'
import { Paragraph } from '../Paragraph'

export const EmptyGalleryStudyplans = () => {
  const { emptyMessage } = useContext(GalleryStudyplansContext)

  return (
    <section
      className={`
        flex flex-col items-center justify-center h-40 w-full bg-gray-60/50 
        border-[5px] border-dashed border-gray-50 rounded-lg px-6 xs:px-12
      `}
    >
      <Paragraph size={3} className='text-gray-20 font-medium text-center'>
        {emptyMessage}
      </Paragraph>
    </section>
  )
}
