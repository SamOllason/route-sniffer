'use server'

import { createClient } from '@/lib/supabase/server'
import { generateWalkRecommendations, generateCustomRoute, WalkRecommendation, RoutePreferences } from '@/lib/ai/openai'
import type { RouteRecommendation } from '@/types/maps'

export async function getRecommendationsAction(
  location: string
): Promise<WalkRecommendation[]> {
  // Check feature flag
  if (process.env.AI_RECOMMENDATIONS_ENABLED !== 'true') {
    throw new Error('AI recommendations are currently unavailable. Please try again later.')
  }

  // Validate user is authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to get recommendations.')
  }

  // Validate location input
  if (!location || location.trim().length === 0) {
    throw new Error('Please enter a location.')
  }

  if (location.trim().length < 2) {
    throw new Error('Please enter a valid location.')
  }

  // Generate recommendations using OpenAI
  try {
    const recommendations = await generateWalkRecommendations(location.trim())
    return recommendations
  } catch (error) {
    // Error is already user-friendly from the utility function
    throw error
  }
}

/**
 * Server Action to generate a custom walking route using AI + Google Maps
 * 
 * Orchestrates: Geocoding → Places → OpenAI → Directions APIs
 * Cost: ~$0.04 per route generation
 */
export async function generateCustomRouteAction(
  location: string,
  preferences: RoutePreferences
): Promise<RouteRecommendation> {
  // Check feature flag
  if (process.env.AI_RECOMMENDATIONS_ENABLED !== 'true') {
    throw new Error('AI route generation is currently unavailable. Please try again later.')
  }

  // Validate user is authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to generate custom routes.')
  }

  // Validate location input
  if (!location || location.trim().length === 0) {
    throw new Error('Please enter a location.')
  }

  if (location.trim().length < 2) {
    throw new Error('Please enter a valid location.')
  }

  // Validate distance
  if (preferences.distance < 1 || preferences.distance > 10) {
    throw new Error('Distance must be between 1 and 10 kilometers.')
  }

  // Generate custom route using AI + Maps APIs
  try {
    const route = await generateCustomRoute(location.trim(), preferences)
    return route
  } catch (error) {
    // Error is already user-friendly from the utility function
    throw error
  }
}
