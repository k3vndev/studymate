import { FONTS } from '@consts'
import { AppIcon } from '@icons'

export const MateHeader = () => (
  <div
    className={`
      ${FONTS.POPPINS} flex gap-3 items-center text-white absolute xl:top-8 sm:top-4 top-20 left-1/2 -translate-x-1/2
      backdrop-blur-lg rounded-full md:px-12 md:py-1.5 px-8 py-0.5 bg-black/75 z-10 border border-white/10
    `}
  >
    <AppIcon className='md:size-8 size-6' />
    <h3 className='font-medium md:text-3xl text-2xl italic'>MATE</h3>
  </div>
)
