import type { Metadata } from 'next'
import './globals.css'

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
      <body className='min-h-dvh bg-black'>{children}</body>
    </html>
  )
}
