import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/github-dark.css'
import { CodeSnippet } from './CodeSnippet'

interface ChildrenProps {
  children: React.ReactNode
  supportCodeSnippets?: boolean
}

export const MarkdownParsed = ({ children, supportCodeSnippets = false }: ChildrenProps) => {
  if (typeof children !== 'string') return children

  if (supportCodeSnippets) {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre({ children }) {
            return <CodeSnippet>{children}</CodeSnippet>
          }
        }}
      >
        {children}
      </ReactMarkdown>
    )
  }

  return <ReactMarkdown>{children}</ReactMarkdown>
}
