'use server'

import { createClient } from '@/lib/supabase/server'
import { generateWalkRecommendations, WalkRecommendation } from '@/lib/ai/openai'

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
