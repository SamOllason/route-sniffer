import type { Coordinates, GeocodeResult } from '@/types/maps'

/**
 * Geocoding utility for converting location text to coordinates
 * Uses Google Maps Geocoding API
 * 
 * @see https://developers.google.com/maps/documentation/geocoding
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

/**
 * Converts a location string (address, place name, postcode) to coordinates
 * 
 * @param location - User's location input (e.g., "Bradford on Avon", "SW1A 1AA", "Hyde Park London")
 * @returns GeocodeResult with coordinates and formatted address
 * @throws Error if API key is missing, location not found, or API error
 * 
 * @example
 * const result = await geocodeLocation('Bradford on Avon')
 * // { coordinates: { lat: 51.3462, lng: -2.2517 }, formattedAddress: 'Bradford on Avon, UK' }
 */
export async function geocodeLocation(location: string): Promise<GeocodeResult> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('GOOGLE_MAPS_API_KEY environment variable is not set')
  }

  if (!location || location.trim().length === 0) {
    throw new Error('Location cannot be empty')
  }

  try {
    // Google Geocoding API endpoint
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    url.searchParams.append('address', location.trim())
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY)

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Check API response status
    if (data.status === 'ZERO_RESULTS') {
      throw new Error(
        `Location "${location}" not found. Please try a more specific address or place name.`
      )
    }

    if (data.status === 'REQUEST_DENIED') {
      throw new Error('Geocoding API access denied. Please check API key permissions.')
    }

    if (data.status === 'INVALID_REQUEST') {
      throw new Error('Invalid location format. Please provide a valid address or place name.')
    }

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error(`Failed to geocode location: ${data.status}`)
    }

    // Extract first (best) result
    const firstResult = data.results[0]
    const { lat, lng } = firstResult.geometry.location

    return {
      coordinates: { lat, lng },
      formattedAddress: firstResult.formatted_address,
      placeId: firstResult.place_id,
    }
  } catch (error) {
    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to geocode location. Please try again.')
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Used to determine how far POIs are from starting location
 * 
 * @param coord1 - First coordinate
 * @param coord2 - Second coordinate
 * @returns Distance in meters
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (coord1.lat * Math.PI) / 180
  const φ2 = (coord2.lat * Math.PI) / 180
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180
  const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}
