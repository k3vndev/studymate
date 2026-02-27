import { Header } from '@@/Header'
import { FocusPageContext } from '@context/FocusPageContext'
import { useContext } from 'react'

interface Props {
  name: string
  currentDay: number
}

export const InfoHeader = ({ name, currentDay }: Props) => {
  const { isStartingUpTimer } = useContext(FocusPageContext)

  return (
    <div className='flex w-full justify-between'>
      <div className='flex flex-col gap-3 text-gray-10 text-xl font-medium'>
        {isStartingUpTimer ? (
          <>
            <span className='animate-pulse'>Starting up focus mode...</span>
            <Header size={3} className='animate-bounce mt-3'>
              Don't leave this screen yet!
            </Header>
          </>
        ) : (
          <>
            <span className='animate-appear'>You're focusing on</span>
            <Header size={3} className='animate-appear'>
              {name}
            </Header>
          </>
        )}
        {!isStartingUpTimer && <span className='text-gray-10 animate-appear'>Day {currentDay}</span>}
      </div>

      {/* Slot at the top right. More options icon was here */}
    </div>
  )
}
