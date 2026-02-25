import { Background } from '@@/Background/Background'
import { Glow } from '@@/Background/Glow'
import { Sidebar } from '@@/Sidebar'

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {children}

      <Sidebar />

      <Background className='bg-[#020202] '>
        <Glow className='bg-[#3e2ed2]/20' pos='left-center' margin={10} />
        <Glow className='bg-[#6313ED]/20' pos='right-bottom' margin={0} />
      </Background>
    </>
  )
}
