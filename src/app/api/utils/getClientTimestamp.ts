import { DateTime, IANAZone } from 'luxon'

/**
 * Converts the client's current time to a UTC timestamp string, based on the client's timezone.
 * @param clientTimezone - The IANA timezone string of the client.
 * @returns A UTC timestamp string or null if the provided timezone is invalid.
 */
export const getClientTimestamp = (clientTimezone: string) => {
  if (!IANAZone.isValidZone(clientTimezone)) {
    return null
  }
  return DateTime.now().setZone(clientTimezone).toUTC().toISO()
}
