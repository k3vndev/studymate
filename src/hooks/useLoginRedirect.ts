import { useRouter } from 'next/navigation'

/**
 * A custom hook that returns a function to redirect the user to the login page with an optional redirect route.
 * If a redirect route is provided, the user will be redirected to that route after logging in. Otherwise, they will be redirected to the dashboard.
 * @param redirectRoute - The optional route to redirect to after logging in.
 * @returns A function that redirects the user to the login page with the appropriate redirect route.
 */
export const useLoginRedirect = (redirectRoute?: string) => {
  const router = useRouter()

  return () => {
    if (redirectRoute) {
      router.push(`/?redirect=${redirectRoute}`)
    } else {
      router.push('/dashboard')
    }
  }
}
