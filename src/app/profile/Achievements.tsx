import { Paragraph } from '@@/Paragraph'
import { TrophyIcon } from '@@/icons'

export const Achievements = () => {
  // This is temporary
  const mock_Achievements = ["You've got a Mate in me", 'Task master', 'Serious learner', 'Study planner']

  /*
    Notes:
    - The color of the trophy icon should depend on the level of the achievement.
    - There are 3 levels: Bronze, Silver and Gold.
    - As for now, all the achievements are Gold.
    - Each achievement should show its description with a tooltip.
  */

  return (
    <ul className='flex flex-wrap gap-x-3 gap-y-2 md:w-[70%] w-full'>
      {mock_Achievements.map(achievement => (
        <li
          key={achievement}
          className='flex items-center gap-1.5 bg-gray-60 border border-gray-30 rounded-full px-3.5 py-1'
        >
          <TrophyIcon className='size-6 text-yellow-500' />
          <Paragraph className='text-nowrap'>{achievement}</Paragraph>
        </li>
      ))}
    </ul>
  )
}
