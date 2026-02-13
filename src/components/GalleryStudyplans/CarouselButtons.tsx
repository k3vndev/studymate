import { GalleryStudyplansContext } from '@/lib/context/GalleryStudyplansContext'
import { ChevronIcon } from '@icons'
import { useContext, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

interface Props {
  ulRef: React.RefObject<HTMLUListElement>
  showItemsCount: number
  tileWidth?: number
}

export const CarouselButtons = ({ ulRef, showItemsCount, tileWidth }: Props) => {
  const { gap } = useContext(GalleryStudyplansContext)
  const [buttonVisible, setButtonVisible] = useState({ left: false, right: false })
  const MIN_DIST_FROM_BORDER = 32
  const initialScroll = useRef(true)

  // Initial scroll to the first tile
  useEffect(() => {
    if (buttonVisible.left && initialScroll.current && tileWidth) {
      initialScroll.current = false
    }
  }, [buttonVisible, tileWidth, ulRef.current])

  // Handles the visibility of the buttons
  const handleULScroll = () => {
    if (ulRef.current == null || !tileWidth) return

    const itemsWidth = tileWidth * showItemsCount + gap * (showItemsCount - 1)
    const scrollLeft = ulRef.current.scrollLeft
    const scrollRight = ulRef.current.scrollWidth - itemsWidth - scrollLeft

    setButtonVisible({
      left: scrollLeft > MIN_DIST_FROM_BORDER,
      right: scrollRight > MIN_DIST_FROM_BORDER
    })
  }

  // Handles the scroll event of the ul element
  useEffect(() => {
    handleULScroll()

    ulRef.current?.addEventListener('scroll', handleULScroll)
    return () => ulRef.current?.removeEventListener('scroll', handleULScroll)
  }, [ulRef.current, showItemsCount, tileWidth])

  // Handles the scroll to the left or right
  const handleScrollButton = (isLeft: boolean) => {
    if (!tileWidth) return

    const direction = isLeft ? -1 : 1
    const scrollAmount = tileWidth * showItemsCount * direction

    ulRef.current?.scrollTo({
      left: ulRef.current.scrollLeft + scrollAmount,
      behavior: 'smooth'
    })
  }

  return (
    <>
      <CarouselButton
        className='left-0 xs:-translate-x-1/2 -translate-x-2'
        onClick={() => handleScrollButton(true)}
        visible={buttonVisible.left}
      >
        <ChevronIcon className='-rotate-90' />
      </CarouselButton>

      <CarouselButton
        className='right-0 xs:translate-x-1/2 translate-x-2'
        onClick={() => handleScrollButton(false)}
        visible={buttonVisible.right}
      >
        <ChevronIcon className='rotate-90' />
      </CarouselButton>
    </>
  )
}

interface CarouselButtonsProps {
  className?: string
  children: React.ReactNode
  onClick: () => void
  visible?: boolean
}

const CarouselButton = ({ className, children, onClick, visible }: CarouselButtonsProps) => {
  const visibility = visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'

  return (
    <div
      className={twMerge(`
        absolute top-[28%] transition-all duration-200 
        ${visibility} ${className}
      `)}
    >
      <button
        className={`
          p-2 rounded-full bg-gray-60 border border-gray-10/50 *:size-8 text-gray-20
          button animate-fade-in-fast shadow-card shadow-black/30 relative
        `}
        onClick={onClick}
        disabled={!visible}
      >
        {children}
      </button>
    </div>
  )
}
