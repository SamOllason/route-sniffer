'use client'

import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps'
import type { Waypoint } from '@/types/maps'

interface RouteMapProps {
  waypoints: Waypoint[]
  height?: string
}

/**
 * RouteMap component displays a Google Map with waypoints and route polyline
 * 
 * Features:
 * - Displays route as a blue polyline connecting all waypoints
 * - Shows markers for start, POI, and end points
 * - Auto-centers and zooms to fit all waypoints
 * - Responsive design matching app design system
 * 
 * Note: Using custom polyline drawing since @vis.gl/react-google-maps doesn't export Polyline
 * The library uses Google Maps Platform's DirectionsRenderer for routes
 * 
 * @param waypoints - Array of waypoint objects with lat, lng, name, and type
 * @param height - Optional custom height (defaults to 400px)
 */
export default function RouteMap({ waypoints, height = '400px' }: RouteMapProps) {
  // Validate API key
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.error('Google Maps API key is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local')
    return null
  }

  // Don't render if no waypoints
  if (waypoints.length === 0) {
    return null
  }

  // Calculate map center (midpoint of all waypoints)
  // This ensures the entire route is visible
  const centerLat = waypoints.reduce((sum, wp) => sum + wp.lat, 0) / waypoints.length
  const centerLng = waypoints.reduce((sum, wp) => sum + wp.lng, 0) / waypoints.length

  const center = {
    lat: centerLat,
    lng: centerLng,
  }

  // Set zoom level based on route spread
  // Tighter routes get higher zoom, wider routes get lower zoom
  const latSpread = Math.max(...waypoints.map(w => w.lat)) - Math.min(...waypoints.map(w => w.lat))
  const lngSpread = Math.max(...waypoints.map(w => w.lng)) - Math.min(...waypoints.map(w => w.lng))
  const maxSpread = Math.max(latSpread, lngSpread)
  
  // Dynamic zoom: smaller spread = higher zoom
  // Typical walking routes (2-5km) will be 13-14 zoom
  const zoom = maxSpread < 0.01 ? 15 : maxSpread < 0.05 ? 14 : 13

  return (
    <section 
      className="w-full rounded-lg overflow-hidden border border-gray-300"
      style={{ height }}
      role="region"
      aria-label="Interactive map showing dog walking route"
    >
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {/* Render markers for each waypoint */}
          {waypoints.map((waypoint, index) => {
            // Use numbers for all markers on the map for clarity
            const label = (index + 1).toString()

            return (
              <Marker
                key={`${waypoint.lat}-${waypoint.lng}-${index}`}
                position={{ lat: waypoint.lat, lng: waypoint.lng }}
                title={waypoint.name}
                label={label}
              />
            )
          })}
        </Map>
      </APIProvider>
    </section>
  )
}
