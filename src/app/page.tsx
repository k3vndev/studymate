import { Button } from '@/components/routes/landing/Button'
import { FONTS } from '@/consts'
import { Background } from '@@/Background/Background'
import { Glow } from '@@/Background/Glow'
import { supabaseServerClient } from '@utils/supabaseServerClient'
import Image from 'next/image'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await supabaseServerClient()

  const auth = await supabase.auth.getUser()
  const { user } = auth.data

  if (user !== null) redirect('/dashboard')

  return (
    <>
      <main className='w-full h-full flex flex-col items-center py-20 max-w-5xl mx-auto [&>section]:w-full [&>section]:flex [&>section]:flex-col [&>section]:items-center [&>section]:justify-center [&>section]:gap-10 gap-16'>
        <section>
          <div className={`text-center mt-8 ${FONTS.POPPINS}`}>
            <h1 className='landing-gradient bg-clip-text text-transparent leading-[1.15] font-extrabold text-7xl py-4 mb-4'>
              Stop just trying to study. Start finishing Studyplans.
            </h1>
            <h2 className='text-3xl text-gray-10 font-semibold'>
              AI-powered learning paths, progress tracking, focus mode, and a study assistant that actually
              remembers what you’re doing.
            </h2>
          </div>

          <div className='relative w-full'>
            <Image
              src='/screenshots/chat.webp'
              alt='Chat screenshot'
              width={1200}
              height={700}
              className='border border-gray-30 rounded-[2rem] border-t-white/20 border-t-2 h-96 w-full'
              style={{ maskImage: 'linear-gradient(to bottom, white, transparent)' }}
              draggable={false}
            />

            <div className='absolute h-fit w-full left-0 flex justify-center bottom-8 gap-4'>
              <Button primary>Sign In</Button>
              <Button>Just Looking Around?</Button>
            </div>
          </div>
        </section>
      </main>

      <Background className='bg-black'>
        <Glow pos='center-top' size={40} className='bg-blue-20/25' />
        <Glow pos='left-bottom' size={10} className='bg-purple-900/10' margin={20} />
        <Glow pos='right-bottom' size={10} className='bg-purple-900/10' margin={20} />
      </Background>
    </>
  )
}
