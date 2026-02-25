/**
 * Formats a number as an ordinal number (e.g., 1st, 2nd, 3rd, etc.).
 * @param n - The number to format as an ordinal.
 * @returns A string representing the ordinal form of the number.
 */
export const formatOrdinalNumber = (n: number) => {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}
