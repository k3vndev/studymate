import { FallbackBox } from '@@/FallbackBox'
import type { DBUserData } from '@types'
import Image from 'next/image'

interface Props {
  profile: DBUserData | null
}

export const UserImage = ({ profile }: Props) => {
  const imageSize = 128

  if (!profile) {
    return <FallbackBox className='rounded-full' style={{ width: imageSize, height: imageSize }} />
  }

  return (
    <Image
      src={profile.avatar_url}
      alt='The profile avatar of the user'
      width={imageSize}
      height={imageSize}
      className='rounded-full'
    />
  )
}
