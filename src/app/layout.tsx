import type { Metadata } from 'next'
import './globals.css'
import { Alert } from '@@/Alert'

export const metadata: Metadata = {
  title: 'Studymate — Enhance your learning with AI',
  description:
    'Enhance your learning with AI. Mate, your virtual assistant, will help you create, follow and complete personalized study plans.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className='min-h-dvh bg-black'>
        <div
          id='app-shell'
          className={`
            min-h-dvh 3xl:px-48 2xl:px-32 xl:px-16 lg:px-32 sm:px-4 grid sm:py-6
          `}
        >
          {children}
          <Alert />
        </div>
      </body>
    </html>
  )
}
