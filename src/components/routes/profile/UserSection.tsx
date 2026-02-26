import { useUserData } from '@hooks/useUserData'
import { Achievements } from './Achievements'
import { MaxStreak } from './MaxStreak'
import { OptionsButton } from './OptionsButton'
import { UserImage } from './UserImage'
import { UserName } from './UserName'

export const UserSection = () => {
  const { profile, cleanUserData } = useUserData()

  return (
    <section className='flex flex-col gap-6 relative animate-fade-in-very-fast'>
      <article className='flex lg:gap-8 sm:gap-6 gap-4 w-full'>
        <UserImage profile={profile} />
        <div className='self-center flex flex-col gap-1 w-full'>
          <UserName profile={profile} />
          <MaxStreak />
        </div>
      </article>
      <Achievements />

      <OptionsButton cleanUserData={cleanUserData} />
    </section>
  )
}
