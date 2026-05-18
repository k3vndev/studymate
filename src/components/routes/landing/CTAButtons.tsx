'use client'

import { supabaseBrowserClient } from '@/lib/utils/supabaseBrowserClient'
import { GithubIcon } from '@@/icons'
import { FONTS } from '@consts'
import { useRouter } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

export const CTAButtons = ({ className = '' }) => {
  const router = useRouter()

  const lookAround = () => {
    router.push('/dashboard')
  }

  const signIn = async () => {
    const supabase = supabaseBrowserClient()

    // Handle redirect
    const searchParams = new URLSearchParams(window.location.search)
    const redirect = searchParams.get('redirect')

    let redirectTo = `${window.location.origin}/auth/callback`
    if (redirect) {
      redirectTo += `?redirect=${redirect}`
    }

    // Sign in with GitHub
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo }
    })
  }

  return (
    <div
      className={twMerge(
        'w-full flex sm:flex-row flex-col items-center justify-center gap-x-4 gap-y-2',
        className
      )}
    >
      <CTAButton className='landing-gradient' onClick={signIn}>
        <GithubIcon />
        Sign In
      </CTAButton>
      <CTAButton className='bg-gray-30' onClick={lookAround}>
        Explore with Guest Access
      </CTAButton>
    </div>
  )
}

interface CTAButtonProps {
  onClick?: () => void
  className?: string
  children: React.ReactNode
}

export const CTAButton = ({ children, onClick, className }: CTAButtonProps) => (
  <button
    onClick={onClick}
    className={twMerge('rounded-full w-fit p-0.5 font-semibold h-fit flex button', FONTS.POPPINS, className)}
  >
    <span className='lg:px-16 px-8 lg:py-2.5 py-2 text-nowrap rounded-full bg-black/65 flex items-center gap-2 lg:text-xl text-lg'>
      {children}
    </span>
  </button>
)
