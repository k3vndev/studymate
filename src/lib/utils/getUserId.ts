import type { SupabaseServerClient } from '@types'

interface Params {
  supabase: SupabaseServerClient
}

export const getUserId = async ({ supabase }: Params) => {
  const { data } = await supabase.auth.getUser()
  if (data.user === null) {
    return null
  }
  return data.user.id
}
