'use client'

import { GithubIcon } from '@icons'
import { supabaseBrowserClient } from '@utils/supabaseBrowserClient'

export const LoginButton = () => {
  const handleSignIn = async () => {
    if (typeof window === 'undefined') return
    const supabase = supabaseBrowserClient()

    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <button
      onClick={handleSignIn}
      className='bg-black border border-[#333] rounded-full px-8 py-3 flex gap-3 items-center button'
    >
      <GithubIcon className='size-6' />
      <span className='text-white'>Sign in with Github</span>
    </button>
  )
}
