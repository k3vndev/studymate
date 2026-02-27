'use client'

import { DropdownMenu } from '@@/DropdownMenu/DropdownMenu'
import { Option } from '@@/DropdownMenu/Option'
import { LogOutIcon } from '@@/icons'
import { supabaseBrowserClient } from '@utils/supabaseBrowserClient'
import { useRouter } from 'next/navigation'

interface Props {
  cleanUserData: () => void
}

export const OptionsButton = ({ cleanUserData }: Props) => {
  const router = useRouter()

  const logOut = async () => {
    const supabase = supabaseBrowserClient()

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
