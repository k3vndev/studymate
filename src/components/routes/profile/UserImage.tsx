import { FallbackBox } from '@@/FallbackBox'
import type { DBUserData } from '@types'
import Image from 'next/image'

interface Props {
  profile: DBUserData | null
}

export const UserImage = ({ profile }: Props) => {
  const imageSize = 128
  const cssSize = { width: `${imageSize}px`, height: `${imageSize}px` }

  if (!profile) {
    return <FallbackBox className='rounded-full aspect-square' style={cssSize} />
  }

  return (
    <Image
      src={profile.avatar_url}
      alt='The profile avatar of the user'
      width={imageSize}
      height={imageSize}
      className='rounded-full aspect-square object-cover sm:max-w-32 max-w-24 sm:max-h-32 max-h-24'
      style={cssSize}
    />
  )
}
