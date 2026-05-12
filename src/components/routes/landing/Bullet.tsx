import { FONTS } from '@consts'
import { XIcon } from 'lucide-react'

interface Props {
  header: string
  kicker: string
}

export const Bullet = ({ header, kicker }: Props) => (
  <li className='flex items-start gap-4'>
    <div className='border border-white/15 rounded-md p-1 bg-white/5'>
      <XIcon />
    </div>

    <div className='flex flex-col gap-1'>
      <h4
        className={`sm:text-3xl text-2xl font-bold text-transparent bg-clip-text landing-gradient ${FONTS.POPPINS}`}
      >
        {header}
      </h4>
      <p className={`sm:text-xl text-lg text-gray-10 ${FONTS.INTER}`}>{kicker}</p>
    </div>
  </li>
)
