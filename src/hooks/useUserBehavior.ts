import { useEffect, useRef } from 'react'

export const useUserBehavior = () => {
  const userHasLeft = useRef(false)

  useEffect(() => {
    userHasLeft.current = false
    return () => {
      userHasLeft.current = true
    }
  }, [])

  /**
   * Executes the given callbacks when the user leaves or stays in the page
   * @param params.gone - Callback to execute both when the user leaves the page and after waitTime has passed
   * @param params.stayed - Callback to execute when the user stays in the page at the moment of the main function call
   * @param params.stayedWaitTime - Callback to execute when the user stays in the page for a certain amount of time
   * @param params.waitTime - Time in milliseconds to wait before executing the stayedWaitTime callback
   *
   * @example
   * const onUser = useUserBehavior()
   * onUser({
   *   gone: () => {
   *     // Logic when user has left the page or after waitTime has passed
   *   }
   * })
   */
  const onUser = ({ gone = () => {}, stayed = () => {}, stayedWaitTime = () => {}, waitTime = 650 }) => {
    if (!userHasLeft.current) {
      stayed()
      setTimeout(() => {
        stayedWaitTime()
        gone()
      }, waitTime)
    } else gone()
  }

  return onUser
}
