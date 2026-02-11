import { CheckIcon, CopyIcon } from '@icons'
import { use, useEffect, useRef, useState } from 'react'

interface Props {
  children: React.ReactNode
}

export const CodeSnippet = ({ children }: Props) => {
  const codeElement = children as any
  const className = codeElement.props.className || ''
  const language = (className as string).replace('language-', '')?.replace('hljs', '') || 'text'

  const [codeWasCopied, setCodeWasCopied] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const preComponentRef = useRef<HTMLPreElement | null>(null)

  const handleCopyCode = () => {
    // Extract text and copy to clipboard
    const text = preComponentRef.current?.innerText || ''
    navigator.clipboard.writeText(text)

    // Handle copied state for UI feedback
    setCodeWasCopied(true)

    clearCopyCodeTimeout()
    timeoutRef.current = setTimeout(() => {
      setCodeWasCopied(false)
      timeoutRef.current = null
    }, 2000)
  }

  // Clear timeout on unmount
  useEffect(() => clearCopyCodeTimeout, [])

  const clearCopyCodeTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  return (
    <div className='relative group border border-white/10 rounded-xl overflow-clip bg-black/40'>
      {/* Header */}
      <div className='flex justify-between items-center px-4 py-2 text-xs rounded-t-xl'>
        <span className=''>{language}</span>

        <button onClick={handleCopyCode} className='flex items-center gap-1 button' disabled={codeWasCopied}>
          {codeWasCopied ? <CheckIcon className='size-4' /> : <CopyIcon className='size-4' />}
          {codeWasCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code */}
      <pre
        className='overflow-x-auto font-mono text-sm *:[background:transparent_!important]'
        ref={preComponentRef}
      >
        {children}
      </pre>
    </div>
  )
}
