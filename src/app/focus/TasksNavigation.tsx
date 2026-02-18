import { TasksContext } from '@/lib/context/TasksContext'
import { useContext } from 'react'
import { twMerge } from 'tailwind-merge'

export const TasksNavigation = () => {
  const { tasks } = useContext(TasksContext)
  const gap = tasks.length < 4 ? 'gap-5' : tasks.length < 6 ? 'gap-4' : 'gap-2'

  return (
    <aside className={`md:w-4 w-3 h-full flex flex-col justify-center ${gap}`}>
      {tasks.map((_, index) => (
        <NavigationPoint key={index} index={index} />
      ))}
    </aside>
  )
}

interface NavigationPointProps {
  index: number
}

const NavigationPoint = ({ index }: NavigationPointProps) => {
  const { tasks, swapTask, selectedTask, isLoading } = useContext(TasksContext)

  const handleClick = () => swapTask(index)
  const opacity = selectedTask === index ? 'opacity-70' : 'hover:opacity-30 opacity-20'
  const bgColor = tasks[index].completed_at ? 'bg-blue-20' : 'bg-white/80'

  return (
    <button
      className={twMerge(`size-3.5 rounded-full button relative ${opacity} ${bgColor} disabled:opacity-10`)}
      onClick={handleClick}
      disabled={isLoading}
    >
      <div className='absolute top-0 left-0 w-full h-full scale-[2]' />
    </button>
  )
}
