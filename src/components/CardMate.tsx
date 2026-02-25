import { Paragraph } from '@@/Paragraph'
import { MATE_IMAGES_ALT } from '@consts'
import { useUserPrompts } from '@hooks/useUserPrompts'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'

interface Props {
  message: string
  children?: React.ReactNode
  className?: {
    main?: string
    image?: string
  }
  onClick?: () => void
}

export const CardMate = ({ message, children, onClick, className }: Props) => {
  const prompts = useUserPrompts()

  return (
    <article
      className={twMerge(`
        bg-card-background border border-card-border 
        w-fit max-w-[40rem] rounded-2xl flex items-center px-8 gap-5 
        card relative xs:mt-0 mt-36 ${className?.main ?? ''}
      `)}
      onClick={onClick ?? prompts.blank}
    >
      <div
        className={`
          self-end xs:relative absolute xs:size-fit size-full top-0 left-0 
          xs:overflow-visible overflow-clip flex justify-center items-end 
          xs:translate-y-0 -translate-y-full
        `}
      >
        <Image
          src='/mate/greeting.webp'
          alt={MATE_IMAGES_ALT.GREETING}
          draggable={false}
          width={160}
          height={150}
          className={twMerge(`
            [scale:1.15] object-cover self-end xs:origin-bottom origin-top
            xs:max-w-40 xs:w-40 aspect-square ${className?.image ?? ''}
          `)}
        />
      </div>

      <main className='flex flex-col gap-5 py-7 w-fit'>
        <Paragraph>{message}</Paragraph>
        <div className='flex justify-end gap-2 max-w-full'>{children}</div>
      </main>
    </article>
  )
}
