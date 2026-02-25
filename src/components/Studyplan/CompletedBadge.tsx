import { GradientBorder } from '@@/GradientBorder'
import { FONTS } from '@consts'
import { throwConfetti } from '@utils/throwConfetti'
import { useEffect, useRef, useState } from 'react'

export const CompletedBadge = () => {
  const timeout = useRef<NodeJS.Timeout>(null)
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => {
    return () => {
      timeout.current && clearTimeout(timeout.current)
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
      className='button disabled:brightness-75 disabled:cursor-default'
      onClick={handleClick}
      disabled={isDisabled}
    >
      <GradientBorder
        color='blues'
        className={{ main: 'py-1.5 px-5 rounded-lg', gradientWrapper: 'brightness-90' }}
        constant
      >
        <span className={`${FONTS.POPPINS} text-xl font-semibold text-white`}>COMPLETED</span>
      </GradientBorder>
    </button>
  )
}
