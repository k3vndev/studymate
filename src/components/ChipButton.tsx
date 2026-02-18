'use client'

import { Waitable } from '@components/Waitable'
import type { ReusableComponent } from '@types'
import { twMerge } from 'tailwind-merge'

type Props = {
  children: React.ReactNode
  onClick?: () => void
  empty?: boolean
  disabled?: boolean
  isLoading?: boolean
} & ReusableComponent

export const ChipButton = ({
  children,
  onClick = () => {},
  empty,
  isLoading = false,
  disabled,
  className = '',
  style
}: Props) => {
  const generalStyle = empty
    ? 'bg-transparent border-blue-10 text-blue-10'
    : 'bg-blue-30 border-[#6168E8] text-white'

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick()
  }

  return (
    <button
      className={twMerge(`
        ${className} ${generalStyle} border rounded-full py-1 lg:px-5 px-3 font-medium text-lg button 
        flex lg:gap-2 gap-1 items-center [&>svg]:size-6 text-nowrap w-fit
      `)}
      onClick={handleClick}
      disabled={disabled || isLoading}
      style={style}
    >
      <Waitable isWaiting={isLoading}>{children}</Waitable>
    </button>
  )
}
