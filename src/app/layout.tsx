import type { Metadata } from 'next'
import './globals.css'
import { Alert } from '@@/Alert'

export const metadata: Metadata = {
  title: 'Studymate — Enhance your learning with AI',
  description:
    'AI-powered learning platform that generates and manages personalized Studyplans. Users can track progress, complete structured learning paths, and interact with an AI assistant designed to guide their studies in real time.'
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
          className='min-h-dvh grid sm:py-6 px-[var(--app-padding-x)] xl:pl-[calc(var(--app-padding-x)+var(--sidebar-width)+var(--sidebar-gap))]'
        >
          {children}

          <Alert />
        </div>
      </body>
    </html>
  )
}
