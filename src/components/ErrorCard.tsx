import { FONTS, MATE_IMAGES_ALT } from '@consts'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'

interface Props {
  children?: React.ReactNode
  className?: string
}

export const ErrorCard = ({ children, className = '' }: Props) => (
  <div
    className={twMerge(
      `absolute top-1/2 -translate-y-1/2 flex flex-col items-center sm:gap-7 gap-5 animate-fade-in-fast ${className}`
    )}
  >
    <Image
      src='/mate/sitting.webp'
      alt={MATE_IMAGES_ALT.SITTING}
      width={172}
      height={172}
      draggable={false}
      className='saturate-[15%]'
    />

    {children}
  </div>
)

interface MessageProps {
  className?: string
  children?: React.ReactNode
}

export const Gigant = ({ className = '', children = 'Ooops...' }: MessageProps) => (
  <span
    className={twMerge(
      `${FONTS.POPPINS} sm:text-5xl text-4xl font-bold text-center text-balance text-white ${className}`
    )}
  >
    {children}
  </span>
)

export const Message = ({ className = '', children = 'Sorry, there was an error' }: MessageProps) => (
  <span
    className={twMerge(
      `${FONTS.POPPINS} sm:text-2xl text-xl text-gray-10 text-pretty text-center ${className}`
    )}
  >
    {children}
  </span>
)

interface ButtonProps {
  className?: string
  onClick?: () => void
  children: React.ReactNode
}

export const Button = ({ className = '', children, onClick = () => {} }: ButtonProps) => (
  <button
    className={twMerge(`
      border border-gray-20 bg-gray-30/25 px-5 py-2 group w-fit text-nowrap
      text-gray-10 text-xl flex gap-2 rounded-lg button items-center ${className}
    `)}
    {...{ onClick }}
  >
    {children}
  </button>
)
