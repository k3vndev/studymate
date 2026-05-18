import { supabaseServerClient } from '@utils/supabaseServerClient'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const codeFromURL = requestUrl.searchParams.get('code')
  const redirectFromURL = requestUrl.searchParams.get('redirect') ?? '/'

  if (codeFromURL !== null) {
    const supabase = await supabaseServerClient()
    await supabase.auth.exchangeCodeForSession(codeFromURL)
  }

  // Redirect to the original page or to the homepage if no redirect query param was provided
  return NextResponse.redirect(`${requestUrl.origin}${redirectFromURL}`)
}
