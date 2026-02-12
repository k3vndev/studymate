export type ValueOrCallback<T> = ((prev: T) => T) | T

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
