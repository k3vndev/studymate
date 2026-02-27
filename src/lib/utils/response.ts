import { NextResponse } from 'next/server'

interface ExtraData {
  msg?: string
  data?: unknown
}

/**
 * Utility function to create a consistent API response format across all endpoints.
 * @param success Indicates whether the API request was successful or not
 * @param statusCode HTTP status code to return
 * @param info Optional additional information to include in the response, such as error messages or data payloads
 * @returns A NextResponse object with a standardized JSON body containing success, message, and data fields, along with the specified HTTP status code
 */
export const response = (success: boolean, statusCode: number, info?: ExtraData) =>
  NextResponse.json({ success, message: info?.msg, data: info?.data }, { status: statusCode })
