import { useOnClickSelector } from '@/hooks/useOnClickSelector'
import { DropdownMenuContext } from '@/lib/context/DropdownMenuContext'
import { useEvent } from '@hooks/useEvent'
import { ChevronIcon, MoreIcon } from '@icons'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { twMerge } from 'tailwind-merge'

interface Props {
  children: React.ReactNode
  className?: {
    main?: string
    button?: string
  }
}

export const DropdownMenu = ({ children, className }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [clientLoaded, setClientLoaded] = useState(false)

  useEffect(() => {
    setClientLoaded(true)
  }, [])

  const manage = {
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(v => !v)
  }

  const IDS = {
    ELEMENT: 'dropdownmenu',
    BUTTON: 'dropdownmenubutton'
  }

  useOnClickSelector(`#${IDS.ELEMENT}, #${IDS.BUTTON}`, hasClicked => {
    if (!hasClicked) manage.close()
  })

  useEvent('keydown', ({ key }: KeyboardEvent) => {
    if (key === 'Escape') manage.close()
  })

  const buttonRef = useRef<HTMLButtonElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const { bottom, left, width } = buttonRef.current.getBoundingClientRect()

      setCoords({
        top: bottom + window.scrollY,
        left: left + width / 2 + window.scrollX
      })
    }
  }, [isOpen])

  const style = isOpen
    ? { menu: 'scale-100 pointer-events-auto', rotation: 'rotate-90' }
    : { menu: 'scale-0 pointer-events-none', rotation: 'rotate-0' }

  return (
    <DropdownMenuContext.Provider value={{ isOpen, manage }}>
      <div className={twMerge(`relative ${className?.main}`)}>
        {clientLoaded &&
          createPortal(
            <article
              style={{
                position: 'absolute',
                top: coords.top,
                left: coords.left
              }}
              className={`
                bg-gray-70 border border-gray-30 z-40 -translate-x-full
                rounded-xl py-2 min-w-32 shadow-card shadow-black/70 origin-top-right ${style.menu} transition
              `}
              id={IDS.ELEMENT}
            >
              {children}
            </article>,
            document.body
          )}

        <button
          ref={buttonRef}
          onClick={manage.toggle}
          className={twMerge(`
            aspect-square button *:size-8 text-gray-10
            ${style.rotation} ${className?.button}
          `)}
          id={IDS.BUTTON}
        >
          {isOpen ? <ChevronIcon className='-rotate-90' /> : <MoreIcon />}
        </button>
      </div>
    </DropdownMenuContext.Provider>
  )
}
