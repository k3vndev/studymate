import type { PostgrestSingleResponse } from '@supabase/supabase-js'

export const databaseQuery = async <T>(query: any) => {
  const { data, error }: PostgrestSingleResponse<T> = await query
  if (error !== null) throw new Error(error.message)
  return data
}
