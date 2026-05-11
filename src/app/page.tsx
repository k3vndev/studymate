import { Background } from '@@/Background/Background'
import { Glow } from '@@/Background/Glow'
import { Bullet } from '@@/routes/landing/Bullet'
import { CTAButtons } from '@@/routes/landing/CTAButtons'
import { FONTS } from '@consts'
import { supabaseServerClient } from '@utils/supabaseServerClient'
import Image from 'next/image'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await supabaseServerClient()

  const auth = await supabase.auth.getUser()
  const { user } = auth.data

  if (user !== null) redirect('/dashboard')

  const bullets = [
    { header: 'Random Tutorials', kicker: 'Consuming content ≠ making progress.' },
    { header: 'No Structure', kicker: 'Learning feels impossible when every path is improvised.' },
    { header: 'No accountability', kicker: 'Without progress tracking, motivation disappears fast.' }
  ]

  const gridImages = ['dashboard', 'studyplan', 'profile']

  return (
    <>
      <main
        className={`w-full flex flex-col items-center py-32 max-w-5xl mx-auto [&>section]:w-full [&>section]:flex [&>section]:flex-col [&>section]:items-center [&>section]:justify-center [&>section]:gap-10 gap-28 ${FONTS.POPPINS}`}
      >
        <section className='text-center'>
          <div>
            <h1 className='landing-gradient bg-clip-text text-transparent leading-[1.15] font-extrabold text-7xl pb-2 mb-4'>
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
              alt='Screenshot of the Studymate chat interface, showing a conversation with Mate, the study assistant and a Studyplan being generated'
              width={1200}
              height={700}
              className='border border-gray-30 rounded-[2rem] border-t-white/15 border-t-2 h-96 w-full object-cover'
              style={{ maskImage: 'linear-gradient(to bottom, white, transparent)' }}
              draggable={false}
            />

            <CTAButtons className='absolute bottom-8 left-0' />
          </div>
        </section>

        <section>
          <h3 className='text-5xl font-bold text-white'>Why Most Self-Learning Fails?</h3>

          <article className='flex items-center gap-8 bg-gradient-to-b from-purple-700/10 to-white/[0.025] px-32 py-16 border border-white/10 rounded-[2rem] border-t-white/15 border-t-2'>
            <Image
              src='/mate/sitting.webp'
              alt='Mate sitting in the floor, looking away thoughtfully'
              width={512}
              height={512}
              draggable={false}
              className='size-64 saturate-[25%]'
            />

            <ul className='flex flex-col gap-6'>
              {bullets.map(bullet => (
                <Bullet key={bullet.header} header={bullet.header} kicker={bullet.kicker} />
              ))}
            </ul>
          </article>
        </section>

        <section className='text-center'>
          <h2 className='landing-gradient bg-clip-text text-transparent leading-[1.15] font-extrabold text-5xl max-w-[55rem] pb-1 text-center'>
            Studymate turns chaotic learning into guided progression.
          </h2>

          <div className='grid grid-cols-2 gap-4'>
            {gridImages.map(image => (
              <Image
                key={image}
                src={`/screenshots/${image}.webp`}
                alt={`Screenshot of the Studymate ${image} page`}
                draggable={false}
                width={1080}
                height={1080}
                className='first:row-span-2 size-full object-cover border border-white/10 rounded-xl first:rounded-l-[2rem] last:rounded-br-[2rem] [&:nth-child(2)]:rounded-tr-[2rem]'
              />
            ))}
          </div>

          <h4 className='text-3xl text-gray-10 font-semibold'>
            AI-powered learning paths, progress tracking, focus mode, and a study assistant that actually
            remembers what you’re doing.
          </h4>

          <CTAButtons />
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
