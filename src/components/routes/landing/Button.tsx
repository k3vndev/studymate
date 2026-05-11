import { FONTS } from '@/consts'
import { twMerge } from 'tailwind-merge'

interface Props {
  onClick?: () => void
  className?: string
  primary?: boolean
  children: React.ReactNode
}

export const Button = ({ primary, children, onClick, className }: Props) => (
  <button
    onClick={onClick}
    className={twMerge(
      'rounded-full p-0.5 font-semibold h-fit flex button text-xl',
      primary ? 'landing-gradient' : 'bg-gray-30',
      FONTS.POPPINS,
      className
    )}
  >
    <span className='px-16 py-2.5 rounded-full bg-black/65'>{children}</span>
  </button>
)
