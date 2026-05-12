import { Alert } from '@@/Alert'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function AppLayout({ children }: Props) {
  return (
    <div
      id='app-shell'
      className='min-h-dvh grid sm:py-6 px-[var(--app-padding-x)] xl:pl-[calc(var(--app-padding-x)+var(--sidebar-width)+var(--sidebar-gap))]'
    >
      {children}

      <Alert />
    </div>
  )
}
