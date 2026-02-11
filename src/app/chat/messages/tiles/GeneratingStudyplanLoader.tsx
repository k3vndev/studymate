import { LoadingIcon } from '@/components/icons'
import { Badge } from '@components/Badge'
import { Header } from '@components/Header'
import { Paragraph } from '@components/Paragraph'
import type { GeneratingStudyplanContent } from '@types'
import { twMerge } from 'tailwind-merge'

interface Props {
  content: GeneratingStudyplanContent
  className?: string
}

export const GeneratingStudyplanLoader = ({ content, className = '' }: Props) => {
  const { name, desc, daily_lessons_count } = content

  return (
    <article
      className={twMerge(`
        w-[22rem] min-h-32 border border-card-border bg-card-background 
        px-5 py-6 flex flex-col gap-1 rounded-2xl cursor-default relative ${className}
      `)}
    >
      {name && desc ? (
        <>
          <Badge className='animate-pulse'>CREATING STUDYPLAN...</Badge>
          <Header className='mb-1 animate-appear'>{name}</Header>
          <Paragraph className='animate-appear'>{desc}</Paragraph>

          <div className='mt-3 flex items-center flex-wrap gap-2 w-full animate-pulse'>
            <LoadingIcon className='animate-spin' />
            {daily_lessons_count !== undefined && (
              <span className='animate-appear'>Generating lesson {daily_lessons_count}...</span>
            )}
          </div>
        </>
      ) : (
        <div className='left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute animate-pulse'>
          <LoadingIcon className='animate-spin size-10' />
        </div>
      )}
    </article>
  )
}
