export interface Params<T> {
  url: string
  options?: RequestInit
  onSuccess?: (data: T, message?: string, status?: number) => void
  onError?: (message?: string, status?: number) => void
  onFinish?: () => void
}

interface JSONResponse<T> {
  success: boolean
  data: T
  message?: string
}

/**
 * A utility function to fetch data from most internal API endpoints and handle success, error, and finish states.
 * The function accepts a URL, fetch options, and optional callbacks for success, error, and finish states. It returns the fetched data if the request is successful, or undefined if there is an error.
 */
export const dataFetch = async <T>({
  url,
  options,
  onSuccess = () => {},
  onError = () => {},
  onFinish = () => {}
}: Params<T>): Promise<T | undefined> => {
  try {
    const res = await fetch(url, options)
    const { success, data, message } = (await res.json()) as JSONResponse<T>

    if (!success || !res.ok) {
      onError(message, res.status)
      return
    }
    onSuccess(data, message, res.status)
    return data
  } catch (errorMessage) {
    onError(errorMessage as string)
  } finally {
    onFinish()
  }
}
