import type { UserStudyplan } from '@types'
import { createContext } from 'react'

interface FocusPageContext {
  userStudyplan: UserStudyplan | null
  isStartingUpTimer: boolean
  setIsStartingUpTimer: (isStartingUp: boolean) => void
}

export const FocusPageContext = createContext<FocusPageContext>({
  userStudyplan: null,
  isStartingUpTimer: true,
  setIsStartingUpTimer: () => {}
})
