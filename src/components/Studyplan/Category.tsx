import { extractCategoryValues } from '@/lib/utils/extractCategoryValues'
import { FONTS } from '@consts'
import type { Category as CategoryType } from '@types'

interface CategoryProps {
  category: CategoryType
}

export const Category = ({ category }: CategoryProps) => {
  const { icon } = extractCategoryValues(category)

  return (
    <span
      className={`
      text-gray-10 $${FONTS.INTER} font-medium text-lg 
      flex gap-2 items-center text-nowrap
    `}
    >
      <div className='*:size-[1.375rem] *:min-w-[1.375rem]'>{icon}</div>
      {category}
    </span>
  )
}
