'use client'

import { DropdownMenu } from '@/components/DropdownMenu/DropdownMenu'
import { Option } from '@/components/DropdownMenu/Option'
import { LogOutIcon } from '@/components/icons'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface Props {
  cleanUserData: () => void
}

export const OptionsButton = ({ cleanUserData }: Props) => {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const logOut = async () => {
    await supabase.auth.signOut()
    cleanUserData()

    router.push('/')
  }

  return (
    <DropdownMenu className={{ main: 'absolute right-0 top-0' }}>
      <Option action={logOut} danger>
        <LogOutIcon />
        Log Out
      </Option>
    </DropdownMenu>
  )
}
