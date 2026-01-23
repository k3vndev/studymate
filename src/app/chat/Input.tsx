import { ChatContext } from '@/lib/context/ChatContext'
import { dispatchEvent } from '@/lib/utils/dispatchEvent'
import { useChatStore } from '@/store/useChatStore'
import { GradientBorder } from '@components/GradientBorder'
import { Paragraph } from '@components/Paragraph'
import { EVENTS, USER_MAX_MESSAGE_LENGTH } from '@consts'
import { ChevronIcon } from '@icons'
import { useContext, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

interface Props {
  className?: string
}

export const Input = ({ className = '' }: Props) => {
  const highlightedMessage = useChatStore(s => s.highlightedMessage)
  const setHighlihtedMessage = useChatStore(s => s.setHighlihtedMessage)
  const setUserInput = useChatStore(s => s.setUserInput)
  const [characterCount, setCharacterCount] = useState(0)

  const { handleSubmit, inputProps, isWaitingResponse, setInputElementHeight } = useContext(ChatContext)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Reset highlighted message and focus on input when it changes
  useEffect(() => {
    if (highlightedMessage !== null) {
      if (highlightedMessage !== '') {
        setUserInput(highlightedMessage)
      }
      focusInput()
      dispatchEvent(EVENTS.ON_HIGHLIGHT_BORDER)
      setHighlihtedMessage(null)
    }
  }, [highlightedMessage])

  // Focus input when component mounts and reset highlighted message on unmount
  useEffect(() => {
    focusInput()
    return () => {
      setHighlihtedMessage(null)
    }
  }, [])

  // Update input element height when it changes
  useEffect(() => {
    if (inputRef.current) {
      setInputElementHeight(inputRef.current.clientHeight)
      setCharacterCount(inputRef.current.value.length)
    }
  }, [inputRef.current?.clientHeight])

  const focusInput = () => {
    if (!inputRef.current) return

    inputRef.current.focus()
    const { length } = inputRef.current.value
    inputRef.current.setSelectionRange(length, length)
  }

  const newInputProps = {
    ...inputProps,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      inputProps.onChange(e)
      setCharacterCount(e.target.value.length)
    }
  }

  const messageTrimLength = newInputProps.value.trim().length

  return (
    <GradientBorder
      color='skySalmon'
      className={{ main: twMerge(`p-1 rounded-[1.625rem] ${className}`) }}
      style={{ contain: 'layout inline-size' }}
      bouncy
    >
      <form
        className={`
          flex justify-between items-center md:px-4 px-3 gap-2
          bg-gray-50 border border-gray-20 rounded-3xl focus-within:border-[#aaa]
          [transition:all_.2s_ease] hover:brightness-110 relative
        `}
        onSubmit={handleSubmit}
      >
        <textarea
          className={`
            min-h-12 py-3 w-full max-w-full placeholder:text-[#363636] bg-transparent 
            outline-none text-gray-10 resize-none [field-sizing:content] peer placeholder:select-none
          `}
          placeholder='Message Mate'
          ref={inputRef}
          {...newInputProps}
          autoFocus
        />
        <button
          className='bg-gray-10/50 rounded-full size-9 min-w-9 flex justify-center items-center group button z-10'
          disabled={isWaitingResponse || !messageTrimLength}
        >
          <ChevronIcon className='text-gray-50 stroke-[2.5px] transition group-active:-translate-y-1' />
        </button>

        <CharacterCounter {...{ characterCount }} />
      </form>
    </GradientBorder>
  )
}

const CharacterCounter = ({ characterCount }: { characterCount: number }) => {
  const remainingCharacters = Math.max(0, USER_MAX_MESSAGE_LENGTH - characterCount)
  const maxRemainingCharacters = USER_MAX_MESSAGE_LENGTH / 3

  const visibility =
    remainingCharacters <= maxRemainingCharacters ? 'opacity-25 bottom-2' : 'opacity-0 bottom-1'

  return (
    <Paragraph
      className={`
        absolute md:right-4 right-3 transition-all duration-200 
        pointer-events-none ${visibility}
      `}
    >
      {remainingCharacters}
    </Paragraph>
  )
}
