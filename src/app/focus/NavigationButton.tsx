import { TasksContext } from '@/lib/context/TasksContext'
import { useContext } from 'react'

interface Props {
  index: number
}

export const NavigationButton = ({ index }: Props) => {
  const { tasks, swapTask, selectedTask, isLoading } = useContext(TasksContext)

  const handleClick = () => swapTask(index)
  const opacity = selectedTask === index ? 'opacity-70' : 'hover:opacity-30 opacity-20'
  const bgColor = tasks[index].completed_at ? 'bg-blue-20' : 'bg-white/80'

  return (
    <button
      className={`size-3.5 rounded-full button relative ${opacity} ${bgColor} disabled:opacity-10`}
      onClick={handleClick}
      disabled={isLoading}
    >
      <div className='absolute top-0 left-0 w-full h-full scale-[2]' />
    </button>
  )
}
