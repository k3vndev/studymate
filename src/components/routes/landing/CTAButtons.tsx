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

    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <div className={twMerge('w-full flex justify-center gap-4', className)}>
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
    className={twMerge(
      'rounded-full p-0.5 font-semibold h-fit flex button text-xl',
      FONTS.POPPINS,
      className
    )}
  >
    <span className='px-16 py-2.5 rounded-full bg-black/65 flex items-center gap-2'>{children}</span>
  </button>
)
