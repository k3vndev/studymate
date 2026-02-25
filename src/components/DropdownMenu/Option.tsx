import { Waitable } from '@@/Waitable'
import { FONTS } from '@consts'
import { DropdownMenuContext } from '@context/DropdownMenuContext'
import type { ReusableComponent } from '@types'
import { useContext, useState } from 'react'
import { twMerge } from 'tailwind-merge'

type Props = {
  children: React.ReactNode
  action: (() => Promise<void>) | (() => void)
  danger?: boolean
} & ReusableComponent

export const Option = ({ children, action, danger = false, className = '', style }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const { manage } = useContext(DropdownMenuContext)

  const handleClick = async () => {
    setIsLoading(true)
    await action()
    setIsLoading(false)
    manage.close()
  }

  const dangerStyle = danger ? 'text-error hover:bg-error/10' : 'text-gray-10 hover:bg-gray-50'

  return (
    <button
      className={twMerge(`
        ${FONTS.INTER} ${dangerStyle} py-3 pl-4 pr-9 w-full flex text-nowrap card group 
        disabled:brightness-75 disabled:pointer-events-none ${className}
      `)}
      onClick={handleClick}
      disabled={isLoading}
      style={style}
    >
      <span className='group-active:scale-95 transition flex gap-2 items-center *:size-6'>
        <Waitable isWaiting={isLoading}>{children}</Waitable>
      </span>
    </button>
  )
}
