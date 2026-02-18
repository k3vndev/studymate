import { TodaysLesson } from '@/app/studyplan/TodaysLesson'
import { useStudyplan } from '@/hooks/useStudyplan'
import { StudyplanContext } from '@/lib/context/StudyplanContext'
import { Badge } from '@components/Badge'
import { Header } from '@components/Header'
import { Paragraph } from '@components/Paragraph'
import type { StudyplanUnion } from '@types'
import { ButtonsSection } from './ButtonsSection'
import { Category } from './Category'
import { DailyLessons } from './DailyLessons'
import { OptionsButton } from './OptionsButton'

interface Props {
  studyplan: StudyplanUnion
  usersCurrent?: boolean
}

export const Studyplan = ({ studyplan, usersCurrent = false }: Props) => {
  const { context, userStudyplan } = useStudyplan({ studyplan, usersCurrent })
  const { name, desc, category, daily_lessons } = context.studyplan

  return (
    <StudyplanContext.Provider value={context}>
      <section className='flex flex-col gap-9 animate-fade-in-very-fast'>
        <div className='flex justify-between items-start'>
          <div className='flex flex-col gap-3 relative'>
            <Badge>STUDYPLAN</Badge>
            <Header size={3}>{name}</Header>
            <Paragraph className='xl:w-5/6 w-[95%]'>{desc}</Paragraph>
          </div>

          <OptionsButton />
        </div>

        <div className='w-full gap-x-16 gap-y-4 flex flex-wrap justify-between'>
          <Category category={category} />

          <ButtonsSection />
        </div>
      </section>

      {usersCurrent && userStudyplan && <TodaysLesson />}
      {daily_lessons && <DailyLessons />}
    </StudyplanContext.Provider>
  )
}
