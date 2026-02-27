import { FONTS } from '@/consts'
import { twMerge } from 'tailwind-merge'
import { MarkdownParsed } from './MarkdownParsed'

interface Props {
  className?: string
  children?: React.ReactNode
  supportCodeSnippets?: boolean
}

export const OverlayBase = ({ className = '', children, supportCodeSnippets = false }: Props) => (
  <li
    className={twMerge(`
      markdown-message
      bg-gradient-to-br from-[-200%] px-6 list-none py-3 text-pretty
      rounded-3xl font-light w-fit ${FONTS.INTER} ${className}
    `)}
  >
    <MarkdownParsed {...{ supportCodeSnippets }}>{children as string}</MarkdownParsed>
  </li>
)
