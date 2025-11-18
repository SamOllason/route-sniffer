import type { Waypoint, DirectionsResult, DirectionStep } from '@/types/maps'

/**
 * Google Directions API utility for calculating walking routes
 * Converts AI-generated waypoints into actual walking directions
 * 
 * @see https://developers.google.com/maps/documentation/directions
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

/**
 * Get walking directions for a route with waypoints
 * 
 * @param waypoints - Array of waypoints (start, POIs, end)
 * @returns DirectionsResult with route details and turn-by-turn directions
 * @throws Error if API key is missing, no route found, or API error
 * 
 * @example
 * const route = await getWalkingDirections([
 *   { lat: 51.3462, lng: -2.2517, name: 'Start' },
 *   { lat: 51.3489, lng: -2.2501, name: 'Park' },
 *   { lat: 51.3462, lng: -2.2517, name: 'End' }
 * ])
 */
export async function getWalkingDirections(waypoints: Waypoint[]): Promise<DirectionsResult> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('GOOGLE_MAPS_API_KEY environment variable is not set')
  }

  if (waypoints.length < 2) {
    throw new Error('At least 2 waypoints required (start and end)')
  }

  try {
    // Extract origin and destination (first and last waypoints)
    const origin = waypoints[0]
    const destination = waypoints[waypoints.length - 1]

    // Middle waypoints (if any)
    const intermediateWaypoints = waypoints.slice(1, -1)

    // Google Directions API endpoint
    const url = new URL('https://maps.googleapis.com/maps/api/directions/json')
    url.searchParams.append('origin', `${origin.lat},${origin.lng}`)
    url.searchParams.append('destination', `${destination.lat},${destination.lng}`)
    url.searchParams.append('mode', 'walking')
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY)

    // Add intermediate waypoints if present
    if (intermediateWaypoints.length > 0) {
      const waypointsParam = intermediateWaypoints
        .map((wp) => `${wp.lat},${wp.lng}`)
        .join('|')
      url.searchParams.append('waypoints', waypointsParam)
    }

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Directions API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Check API response status
    if (data.status === 'ZERO_RESULTS') {
      throw new Error('No walking route found between these points. Try different locations.')
    }

    if (data.status === 'NOT_FOUND') {
      throw new Error('One or more waypoints could not be located. Please check coordinates.')
    }

    if (data.status === 'REQUEST_DENIED') {
      throw new Error('Directions API access denied. Please check API key permissions.')
    }

    if (data.status === 'INVALID_REQUEST') {
      throw new Error('Invalid route request. Please check waypoints.')
    }

    if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
      throw new Error(`Failed to calculate route: ${data.status}`)
    }

    // Extract route data from first (best) route
    const route = data.routes[0]
    const leg = route.legs[0] // For simplicity, using first leg

    // Calculate total distance and duration across all legs
    let totalDistance = 0
    let totalDuration = 0
    const allSteps: DirectionStep[] = []

    route.legs.forEach((routeLeg: any) => {
      totalDistance += routeLeg.distance.value
      totalDuration += routeLeg.duration.value

      // Collect all steps
      routeLeg.steps.forEach((step: any) => {
        allSteps.push({
          distance: step.distance.value,
          duration: step.duration.value,
          instruction: step.html_instructions,
          startLocation: {
            lat: step.start_location.lat,
            lng: step.start_location.lng,
          },
          endLocation: {
            lat: step.end_location.lat,
            lng: step.end_location.lng,
          },
          polyline: step.polyline.points,
        })
      })
    })

    return {
      distance: totalDistance, // In meters
      duration: totalDuration, // In seconds
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      waypoints,
      overviewPolyline: route.overview_polyline.points,
      steps: allSteps,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to calculate walking route. Please try again.')
  }
}

/**
 * Format distance from meters to human-readable string
 * 
 * @example
 * formatDistance(1500) // "1.5km"
 * formatDistance(800) // "800m"
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`
  }
  return `${Math.round(meters)}m`
}

/**
 * Format duration from seconds to human-readable string
 * 
 * @example
 * formatDuration(3600) // "1h 0m"
 * formatDuration(1800) // "30m"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
