import { Background } from '@components/Background/Background'
import { Glow } from '@components/Background/Glow'

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {children}

      <Background>
        <Glow margin={20} className='bg-blue-30/5' pos='left-bottom' />
        <Glow className='bg-blue-30/20' pos='center-top' />
        <Glow margin={20} className='bg-blue-30/5' pos='right-bottom' />
      </Background>
    </>
  )
}
