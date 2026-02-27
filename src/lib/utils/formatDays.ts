/**
 * Formats a number of days into a string with correct pluralization.
 * @param n - The number of days.
 * @returns A string representing the number of days with correct pluralization.
 */
export const formatDays = (n: number) => {
  const s = n !== 1 ? 's' : ''
  return `${n} day${s}`
}
