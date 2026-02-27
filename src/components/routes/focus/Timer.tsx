import { FocusPageContext } from '@/lib/context/FocusPageContext'
import { FONTS } from '@consts'
import { useFocusTimer } from '@hooks/useFocusTimer'
import { useContext } from 'react'

interface Props {
  studyplanId: string
}

export const Timer = ({ studyplanId }: Props) => {
  const { displayTimer, decorativeCircleStyle } = useFocusTimer({ studyplanId })
  const { isStartingUpTimer } = useContext(FocusPageContext)

  return (
    <div className='relative size-full'>
      <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        {/* Text timer */}
        {!isStartingUpTimer && (
          <span
            className={`text-white/85 xl:text-9xl sm:text-8xl text-6xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-fade-in-fast [&>span]:${FONTS.AZERET_MONO}}`}
            style={{
              textShadow: '0px 0px 0.25rem rgba(255, 255, 255, 0.5)',
              animationDuration: '600ms'
            }}
          >
            <span>{displayTimer.h}</span>:<span>{displayTimer.m}</span>:
            <span className='opacity-65'>{displayTimer.s}</span>
          </span>
        )}

        {/* Decorative Circle */}
        <div
          className='absolute md:size-72 xs:size-48 size-40 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-circle-shape shadow-blue-10/15 animate-pulse transition'
          style={decorativeCircleStyle}
        />
      </span>
    </div>
  )
}
