'use client'

import { useState, useTransition } from 'react'
import { generateCustomRouteAction, saveGeneratedWalkAction } from './actions'
import CustomRouteForm, { CustomRouteFormData } from '@/components/CustomRouteForm'
import RouteMap from '@/components/RouteMap'
import type { RouteRecommendation } from '@/types/maps'
import toast from 'react-hot-toast'

/**
 * Helper function to get emoji icon for a waypoint based on its type/category
 */
function getWaypointEmoji(waypoint: RouteRecommendation['waypoints'][0]): string {
  if (waypoint.type === 'start' || waypoint.type === 'end') {
    return '🏁'
  }
  
  switch (waypoint.category) {
    case 'cafe':
      return '☕'
    case 'park':
    case 'dog_park':
      return '🌳'
    case 'water':
      return '💧'
    default:
      return '📍'
  }
}

export default function RecommendationsClient() {
  const [customRoute, setCustomRoute] = useState<RouteRecommendation | null>(null)
  const [lastFormData, setLastFormData] = useState<CustomRouteFormData | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showEmojiRain, setShowEmojiRain] = useState(false)
  const [isWiggling, setIsWiggling] = useState(false)

  async function handleCustomRouteSubmit(data: CustomRouteFormData) {
    // Store the form data for "Show Me Another" functionality
    setLastFormData(data)
    // Reset saved state when generating a new route
    setIsSaved(false)
    
    startTransition(async () => {
      try {
        const route = await generateCustomRouteAction(data.location, {
          distance: data.distance,
          mustInclude: data.mustInclude,
          preferences: data.preferences,
          circular: data.circular,
        })
        setCustomRoute(route)
        toast.success('Custom route generated!')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate custom route'
        toast.error(message)
        setCustomRoute(null)
      }
    })
  }

  function handleShowMeAnother() {
    if (!lastFormData) return
    
    // Re-submit with same data - AI will generate a different route
    handleCustomRouteSubmit(lastFormData)
  }

  /**
   * Save the current AI-generated route as a walk in the database
   * Easter egg: Button wiggles like a happy dog, then emoji rain! 🐕
   */
  async function handleSaveWalk() {
    if (!customRoute || isSaving || isSaved || isWiggling) return

    // Start the wiggle animation (like an excited dog!)
    setIsWiggling(true)
    
    // Wait for wiggle to complete (2 seconds), then save
    setTimeout(async () => {
      setIsWiggling(false)
      setIsSaving(true)
      
      try {
        await saveGeneratedWalkAction(customRoute)
        setIsSaved(true)
        // Trigger emoji rain celebration! 🎉
        setShowEmojiRain(true)
        setTimeout(() => setShowEmojiRain(false), 3000)
        toast.success('Walk saved successfully!')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to save walk'
        toast.error(message)
      } finally {
        setIsSaving(false)
      }
    }, 2000)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-900">
          ✨ Sniff Routes with AI!
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Generate personalized dog walking routes for any location
        </p>
      </div>

      {/* Custom Route Form */}
      <div className="mb-6 sm:mb-8 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <CustomRouteForm onSubmit={handleCustomRouteSubmit} isLoading={isPending} />
      </div>

      {/* Loading State */}
      {isPending && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Generating your custom route...</p>
        </div>
      )}

      {/* Custom Route Results */}
      {!isPending && customRoute && (
        <div className="space-y-4 sm:space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            {/* Route Header */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {customRoute.routeName}
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600">
                <span>📏 {customRoute.estimatedDistance}</span>
                {customRoute.directions && (
                  <span>⏱️ {Math.round(customRoute.directions.duration / 60)} min</span>
                )}
              </div>
              <p className="mt-3 text-sm sm:text-base text-gray-700">{customRoute.highlights}</p>
            </div>

            {/* Waypoints */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Route Waypoints</h3>
              <ol className="space-y-2">
                {customRoute.waypoints.map((waypoint, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 flex items-center gap-2">
                      <span className="text-base">{getWaypointEmoji(waypoint)}</span>
                      {waypoint.placeId ? (
                        <a
                          href={`https://www.google.com/maps/place/?q=place_id:${waypoint.placeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {waypoint.name}
                        </a>
                      ) : (
                        waypoint.name
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleShowMeAnother}
                disabled={isPending}
                className="flex-1 rounded-lg bg-white border-2 border-blue-600 px-4 sm:px-6 py-3 font-semibold text-blue-600 
                  hover:bg-blue-50 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed
                  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              >
                {isPending ? 'Generating...' : '🔄 Show Me Another'}
              </button>
              <button
                onClick={handleSaveWalk}
                disabled={isSaving || isSaved || isWiggling}
                className={`flex-1 rounded-lg bg-blue-600 px-4 sm:px-6 py-3 font-semibold text-white 
                  hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition
                  ${isWiggling ? 'animate-wiggle' : ''}`}
              >
                {isWiggling ? '🐶 {wag wag wiggle wiggle}...' : isSaving ? '💾 Saving...' : isSaved ? '✅ Saved!' : '💾 Save Walk'}
              </button>
            </div>

            {/* Map Display */}
            <div className="mt-6 mb-4 sm:mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Route Map</h3>
              <RouteMap 
                waypoints={customRoute.waypoints} 
                directions={customRoute.directions}
                height="350px" 
              />
            </div>

            {/* Turn-by-Turn Directions */}
            {customRoute.directions && customRoute.directions.steps.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Turn-by-Turn Directions</h3>
                <div className="space-y-2 text-sm">
                  {customRoute.directions.steps.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <span className="text-gray-400">{index + 1}.</span>
                      <div
                        className="text-gray-700"
                        dangerouslySetInnerHTML={{ __html: step.instruction }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isPending && !customRoute && (
        <div className="text-center py-12 text-gray-500">
          <p>Fill in the form above to generate a custom walking route!</p>
        </div>
      )}

      {/* 🎉 Emoji Rain Easter Egg - shows when walk is saved! */}
      {showEmojiRain && (
        <div 
          className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          {/* Generate falling emojis */}
          {[...Array(30)].map((_, i) => (
            <span
              key={i}
              className="absolute text-3xl sm:text-4xl animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              {['🐕', '🐾', '🦴', '❤️', '🎉'][Math.floor(Math.random() * 5)]}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
