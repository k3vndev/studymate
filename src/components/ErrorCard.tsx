import { FONTS, MATE_IMAGES_ALT } from '@consts'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'

interface Props {
  className?: string
  title?: string
  paragraph?: string

  button?: {
    icon?: React.ReactNode
    text: string
    onClick: () => void
  }
}

export const ErrorCard = ({
  title = 'Oops...',
  paragraph = 'Sorry, there was an error',
  button,
  className
}: Props) => {
  const imgSize = 172

  return (
    <div
      className={twMerge(
        'flex flex-col items-center sm:gap-7 gap-5 animate-fade-in-fast m-auto -translate-y-8',
        className
      )}
    >
      <Image
        src='/mate/sitting.webp'
        alt={MATE_IMAGES_ALT.SITTING}
        width={imgSize}
        height={imgSize}
        draggable={false}
        className='saturate-[15%]'
      />

      {title && <Gigant>{title}</Gigant>}
      {paragraph && <Message>{paragraph}</Message>}

      {button && (
        <Button onClick={button.onClick}>
          {button.icon}
          {button.text}
        </Button>
      )}
    </div>
  )
}
interface TextProps {
  children: string
}

const Gigant = ({ children }: TextProps) => (
  <span
    className={twMerge('sm:text-5xl text-4xl font-bold text-center text-balance text-white', FONTS.POPPINS)}
  >
    {children}
  </span>
)

const Message = ({ children }: TextProps) => (
  <span className={twMerge('sm:text-2xl text-xl text-gray-10 text-balance text-center', FONTS.POPPINS)}>
    {children}
  </span>
)

interface ButtonProps {
  onClick?: () => void
  children: React.ReactNode
}

const Button = ({ children, onClick = () => {} }: ButtonProps) => (
  <button
    className={twMerge(
      'border border-gray-20 bg-gray-30/25 px-5 py-2 group w-fit text-nowrap text-gray-10 text-xl flex gap-2 rounded-lg button items-center'
    )}
    {...{ onClick }}
  >
    {children}
  </button>
)
