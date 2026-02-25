import { supabaseServerClient } from '@/lib/utils/supabaseServerClient'
import { AppLogo } from '@@/AppLogo'
import { Background } from '@@/Background/Background'
import { Glow } from '@@/Background/Glow'
import { LoginButton } from '@@/LoginButton'
import Image from 'next/image'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await supabaseServerClient()

  const auth = await supabase.auth.getUser()
  const { user } = auth.data

  if (user !== null) redirect('/dashboard')

  return (
    <>
      <main className='w-full h-full flex flex-col items-center justify-between py-20'>
        <div className='flex flex-col items-center gap-4'>
          <Image
            src='/favicon.ico'
            alt='App Logo'
            width={300}
            height={300}
            className='size-32'
            draggable={false}
          />
          <AppLogo />
        </div>
        <LoginButton />
      </main>

      <Background className='bg-black'>
        <Glow pos='center-top' size={40} className='bg-blue-20/25' />
        <Glow pos='left-bottom' size={10} className='bg-purple-900/10' margin={20} />
        <Glow pos='right-bottom' size={10} className='bg-purple-900/10' margin={20} />
      </Background>
    </>
  )
}
