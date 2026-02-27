'use client'

import { Background } from '@@/Background/Background'
import { Glow } from '@@/Background/Glow'
import { Button, ErrorCard, Gigant, Message } from '@@/ErrorCard'
import { Main } from '@@/Main'
import { Sidebar } from '@@/Sidebar'
import { ArrowIcon } from '@@/icons'

export default function NotFoundPage() {
  return (
    <>
      <Main className='gap-12 h-full flex items-center justify-center relative'>
        <ErrorCard className=''>
          <Gigant>404, Not Found</Gigant>
          <Message>
            The page you are looking for does not exist. It might have been removed or you may have mistyped
            the URL.
          </Message>
          <Button>
            <ArrowIcon className='rotate-90' />
            <a href='/' className='w-full h-full'>
              Go back to Dashboard
            </a>
          </Button>
        </ErrorCard>
      </Main>
      <Sidebar />

      <Background>
        <Glow className='bg-black' pos='left-bottom' />
        <Glow className='bg-black' pos='right-top' />
      </Background>
    </>
  )
}
