'use client'

import { Background } from '@@/Background/Background'
import { Glow } from '@@/Background/Glow'
import { ErrorCard } from '@@/ErrorCard'
import { Main } from '@@/Main'
import { Sidebar } from '@@/Sidebar'
import { ArrowIcon } from '@@/icons'
import { useRouter } from 'next/navigation'

export default function NotFoundPage() {
  const router = useRouter()
  const handleGoBack = () => {
    router.push('/dashboard')
  }

  return (
    <>
      <Main className='gap-12 h-full flex items-center justify-center relative'>
        <ErrorCard
          title='404, Not Found'
          paragraph='The page you are looking for does not exist. It might have been removed or you may have mistyped the URL.'
          button={{
            icon: <ArrowIcon className='rotate-90' />,
            onClick: handleGoBack,
            text: 'Go back to Dashboard'
          }}
        />
      </Main>
      <Sidebar />

      <Background>
        <Glow className='bg-black' pos='left-bottom' />
        <Glow className='bg-black' pos='right-top' />
      </Background>
    </>
  )
}
