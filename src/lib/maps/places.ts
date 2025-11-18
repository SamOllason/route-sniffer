import type { Coordinates, Place, NearbySearchParams } from '@/types/maps'
import { calculateDistance } from './geocoding'

/**
 * Google Places API utility for finding nearby points of interest
 * 
 * @see https://developers.google.com/maps/documentation/places/web-service/search-nearby
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

/**
 * Finds nearby places (parks, cafes, dog parks, etc.) within a radius
 * 
 * @param params - Search parameters (location, radius, type, keyword)
 * @returns Array of Place objects sorted by rating and distance
 * @throws Error if API key is missing or API error occurs
 * 
 * @example
 * const parks = await findNearbyPOIs({
 *   location: { lat: 51.3462, lng: -2.2517 },
 *   radius: 2000, // 2km
 *   type: 'park'
 * })
 */
export async function findNearbyPOIs(params: NearbySearchParams): Promise<Place[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('GOOGLE_MAPS_API_KEY environment variable is not set')
  }

  const { location, radius, type, keyword } = params

  // Validate radius (Google Places API max is 50km)
  if (radius > 50000) {
    throw new Error('Radius cannot exceed 50,000 meters (50km)')
  }

  try {
    // Google Places Nearby Search API endpoint
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
    url.searchParams.append('location', `${location.lat},${location.lng}`)
    url.searchParams.append('radius', radius.toString())
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY)

    if (type) {
      url.searchParams.append('type', type)
    }

    if (keyword) {
      url.searchParams.append('keyword', keyword)
    }

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Places API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Check API response status
    if (data.status === 'ZERO_RESULTS') {
      return [] // No places found - return empty array (not an error)
    }

    if (data.status === 'REQUEST_DENIED') {
      throw new Error('Places API access denied. Please check API key permissions.')
    }

    if (data.status === 'INVALID_REQUEST') {
      throw new Error('Invalid search parameters.')
    }

    if (data.status !== 'OK' || !data.results) {
      throw new Error(`Failed to search places: ${data.status}`)
    }

    // Transform API results to our Place type
    const places: Place[] = data.results.map((result: any) => ({
      placeId: result.place_id,
      name: result.name,
      location: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      vicinity: result.vicinity || '',
      rating: result.rating,
      userRatingsTotal: result.user_ratings_total,
      types: result.types || [],
      openingHours: result.opening_hours
        ? { openNow: result.opening_hours.open_now }
        : undefined,
      // Calculate distance from starting location
      distanceFromStart: calculateDistance(location, {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      }),
    }))

    // Sort by rating (descending) and distance (ascending)
    return places.sort((a, b) => {
      // Prioritize highly rated places
      if (a.rating && b.rating) {
        const ratingDiff = b.rating - a.rating
        if (Math.abs(ratingDiff) > 0.5) return ratingDiff
      }

      // Then sort by distance
      const distA = a.distanceFromStart || Infinity
      const distB = b.distanceFromStart || Infinity
      return distA - distB
    })
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to search for nearby places. Please try again.')
  }
}

/**
 * Find dog-friendly parks near a location
 * Convenience wrapper around findNearbyPOIs
 */
export async function findNearbyParks(location: Coordinates, radius: number): Promise<Place[]> {
  return findNearbyPOIs({
    location,
    radius,
    type: 'park',
  })
}

/**
 * Find dog-friendly cafes/restaurants near a location
 * Searches for cafes with "dog friendly" in reviews/descriptions
 */
export async function findDogFriendlyCafes(
  location: Coordinates,
  radius: number
): Promise<Place[]> {
  return findNearbyPOIs({
    location,
    radius,
    type: 'cafe',
    keyword: 'dog friendly',
  })
}

/**
 * Find dedicated dog parks near a location
 */
export async function findDogParks(location: Coordinates, radius: number): Promise<Place[]> {
  return findNearbyPOIs({
    location,
    radius,
    keyword: 'dog park',
  })
}

/**
 * Find all relevant POIs for dog walking route planning
 * Returns parks, cafes, and dog parks combined
 */
export async function findAllDogWalkingPOIs(
  location: Coordinates,
  radius: number
): Promise<{
  parks: Place[]
  cafes: Place[]
  dogParks: Place[]
  all: Place[]
}> {
  // Run searches in parallel for better performance
  const [parks, cafes, dogParks] = await Promise.all([
    findNearbyParks(location, radius),
    findDogFriendlyCafes(location, radius),
    findDogParks(location, radius),
  ])

  // Combine and deduplicate by place_id
  const allPlaces = [...parks, ...cafes, ...dogParks]
  const uniquePlaces = Array.from(new Map(allPlaces.map((p) => [p.placeId, p])).values())

  return {
    parks,
    cafes,
    dogParks,
    all: uniquePlaces,
  }
}
