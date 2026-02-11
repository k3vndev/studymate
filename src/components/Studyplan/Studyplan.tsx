import { dataParser } from '@/app/api/utils/dataParser'
import { TodaysLesson } from '@/app/studyplan/TodaysLesson'
import { useStudyplan } from '@/hooks/useStudyplan'
import { useUserData } from '@/hooks/useUserData'
import { StudyplanContext } from '@/lib/context/StudyplanContext'
import { useStudyplansStore } from '@/store/useStudyplansStore'
import { useUserStore } from '@/store/useUserStore'
import { Badge } from '@components/Badge'
import { Header } from '@components/Header'
import { Paragraph } from '@components/Paragraph'
import { useUserStudyplan } from '@hooks/useUserStudyplan'
import type { StudyplanUnSaved } from '@types'
import { useEffect } from 'react'
import { ButtonsSection } from './ButtonsSection'
import { Category } from './Category'
import { DailyLessons } from './DailyLessons'
import { OptionsButton } from './OptionsButton'

export interface Props {
  studyplan: StudyplanUnSaved & {
    id?: string | null
    created_by?: string | null
    original_id?: string | null
    chat_message_id?: string | null
  }
  usersCurrent?: boolean
}

export const Studyplan = ({ studyplan, usersCurrent = false }: Props) => {
  const { context, userStudyplan } = useStudyplan({ studyplan, usersCurrent })
  const { name, desc, category } = context.studyplan

  console.log(dataParser.fromStudyplanToModelPrompt(studyplan))

  return (
    <StudyplanContext.Provider value={context}>
      <section className='flex flex-col gap-9'>
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

      {usersCurrent && userStudyplan && <TodaysLesson day={userStudyplan.current_day} />}
      <DailyLessons />
    </StudyplanContext.Provider>
  )
}
