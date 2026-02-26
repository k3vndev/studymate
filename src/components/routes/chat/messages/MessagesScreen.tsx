import { Input } from '../Input'
import { MateHeader } from '../MateHeader'
import { ScrollDownButton } from '../ScrollDownButton'
import { MessagesList } from './MessagesList'

export const MessagesScreen = () => (
  <>
    <MateHeader />
    <MessagesList />
    <Input
      className={`
        absolute bottom-5 left-1/2 -translate-x-1/2
        3xl:w-[calc(100%-11rem*2+0.5rem)] lg:w-[calc(100%-7rem*2+0.5rem)] sm:w-[calc(100%-4rem*2+0.5rem)] 
        xs:w-[calc(100%-2rem*2+0.5rem)] w-[calc(100%-1rem*2+0.5rem)]
      `}
    />
    <ScrollDownButton />
  </>
)
