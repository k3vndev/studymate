import { Header } from '@@/Header'

interface Props {
  name: string
  currentDay: number
}

export const InfoHeader = ({ name, currentDay }: Props) => (
  <div className='flex w-full justify-between'>
    <div className='flex flex-col gap-3'>
      <span className='text-gray-10 text-xl font-medium'>You're focusing on</span>
      <Header size={3}>{name}</Header>
      <span className='text-gray-10'>Day {currentDay}</span>
    </div>

    {/* Slot at the top right. More options icon was here */}
  </div>
)
