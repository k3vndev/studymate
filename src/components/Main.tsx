import { twMerge } from 'tailwind-merge'

interface Props {
  children: React.ReactNode
  className?: string
}

export const Main = ({ children, className = '' }: Props) => (
  <main
    className={twMerge(`
      lg:px-24 sm:px-16 xs:px-8 px-4 sm:py-20 pt-24 pb-12
      bg-main-background sm:border sm:rounded-3xl border-card-border flex flex-col 
      min-h-[calc(100vh-3rem)] xl:mt-0 sm:mt-16 w-full ${className}
    `)}
    id='main'
  >
    {children}
  </main>
)
// mt-14
