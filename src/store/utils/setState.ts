/**
 * Utility type to recieve either a value or a callback that produces a value based on the previous state.
 */
export type ValueOrCallback<T> = ((prev: T) => T) | T

/**
 * A helper function to update a specific key in the state, either by providing a new value directly or a callback that receives the previous value and returns the new value. An optional postProcess function can be provided to transform the new value before it's set in the state.
 *
 * @template T - The type of the state object.
 * @template K - The specific key in the state object to update.
 * @param state - The current state object.
 * @param key - The key in the state object to update.
 * @param valueOrCallback - The new value or a callback that receives the previous value and returns the new value.
 * @param postProcess - An optional function to transform the new value before it's set in the state.
 * @returns The updated state object.
 */
export const setState = <T, K extends keyof T>(
  state: T,
  key: K,
  valueOrCallback: ValueOrCallback<T[K]>,
  postProcess: (value: T[K]) => T[K] = v => v
): T => {
  const prevValue = state[key]

  const nextValue =
    typeof valueOrCallback === 'function'
      ? (valueOrCallback as (prev: T[K]) => T[K])(structuredClone(prevValue))
      : valueOrCallback

  return { ...state, [key]: postProcess(nextValue) }
}
