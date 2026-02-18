import { throwConfetti } from '@/lib/utils/throwConfetti'
import { GradientBorder } from '@@/GradientBorder'
import { FONTS } from '@consts'
import { useEffect, useRef, useState } from 'react'

export const CompletedBadge = () => {
  const timeout = useRef<NodeJS.Timeout>()
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => {
    return () => {
      clearTimeout(timeout.current)
      setIsDisabled(false)
    }
  }, [])

  const handleClick = () => {
    throwConfetti()
    setIsDisabled(true)

    timeout.current = setTimeout(() => {
      setIsDisabled(false)
    }, 5000)
  }

  return (
    <button
      className='card disabled:brightness-75 disabled:cursor-default'
      onClick={handleClick}
      disabled={isDisabled}
    >
      <GradientBorder
        color='blues'
        className={{ main: 'py-1 px-4 rounded-lg', gradientWrapper: 'brightness-90' }}
        constant
      >
        <span className={`${FONTS.POPPINS} text-2xl font-semibold text-white`}>COMPLETED</span>
      </GradientBorder>
    </button>
  )
}
