import { FONTS } from '@consts'
import { useFocusTimer } from '@hooks/useFocusTimer'

interface Props {
  studyplanId: string
}

export const Timer = ({ studyplanId }: Props) => {
  const { displayTimer, isStartingUp, decorativeCircleStyle } = useFocusTimer({ studyplanId })

  // TODO: Show encouraging messages under the timer

  return (
    <div className='relative size-full'>
      <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        {/* Text timer */}
        {!isStartingUp && (
          <span
            className={`text-white/85 xl:text-9xl sm:text-8xl text-6xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-fade-in-fast [&>span]:${FONTS.AZERET_MONO}}`}
            style={{
              textShadow: '0px 0px 0.25rem rgba(255, 255, 255, 0.5)',
              animationDuration: '600ms'
            }}
          >
            <span>{displayTimer.h}</span>:<span>{displayTimer.m}</span>:<span>{displayTimer.s}</span>
          </span>
        )}

        {/* Decorative Circle */}
        <div
          className='absolute size-64 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-circle shadow-blue-10/15 animate-pulse transition'
          style={decorativeCircleStyle}
        />
        {isStartingUp && (
          <div
            className={`flex flex-col items-center gap-1 z-50 text-nowrap animate-bounce-once ${FONTS.POPPINS}`}
            style={{
              animationDelay: '400ms',
              animationDuration: '800ms'
            }}
          >
            <span className='text-xl font-semibold animate-pulse '>Starting to focus...</span>
            <span className='text-3xl'>Don't leave this screen yet!</span>
          </div>
        )}
      </span>
    </div>
  )
}
