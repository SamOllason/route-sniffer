/**
 * Quick test script to verify Google Maps API utilities work
 * Run with: npx tsx test-maps.ts
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv'
config({ path: '.env.local' })

// Now import utilities (they will see the env vars)
import { geocodeLocation } from './src/lib/maps/geocoding'
import { findAllDogWalkingPOIs } from './src/lib/maps/places'
import { getWalkingDirections, formatDistance, formatDuration } from './src/lib/maps/directions'

async function testMapsAPIs() {
  console.log('🧪 Testing Google Maps APIs...\n')
  
  // Debug: Check if API key is loaded
  console.log('🔑 API Key loaded:', process.env.GOOGLE_MAPS_API_KEY ? 'Yes ✅' : 'No ❌')
  console.log('')

  try {
    // Test 1: Geocoding
    console.log('1️⃣ Testing Geocoding API...')
    const location = await geocodeLocation('Bradford on Avon, UK')
    console.log('✅ Geocoded:', location.formattedAddress)
    console.log('   Coordinates:', location.coordinates)
    console.log('')

    // Test 2: Places API
    console.log('2️⃣ Testing Places API...')
    const pois = await findAllDogWalkingPOIs(location.coordinates, 2000)
    console.log(`✅ Found ${pois.all.length} total POIs:`)
    console.log(`   - ${pois.parks.length} parks`)
    console.log(`   - ${pois.cafes.length} dog-friendly cafes`)
    console.log(`   - ${pois.dogParks.length} dog parks`)
    
    if (pois.parks.length > 0) {
      console.log(`   Top park: ${pois.parks[0].name} (${pois.parks[0].rating}⭐)`)
    }
    console.log('')

    // Test 3: Directions API
    console.log('3️⃣ Testing Directions API...')
    
    // Create simple test route: start → park → start (circular)
    const testWaypoints = [
      { lat: location.coordinates.lat, lng: location.coordinates.lng, name: 'Start' },
    ]
    
    if (pois.parks.length > 0) {
      testWaypoints.push({
        lat: pois.parks[0].location.lat,
        lng: pois.parks[0].location.lng,
        name: pois.parks[0].name,
      })
    }
    
    testWaypoints.push({
      lat: location.coordinates.lat,
      lng: location.coordinates.lng,
      name: 'End',
    })

    const directions = await getWalkingDirections(testWaypoints)
    console.log('✅ Route calculated:')
    console.log(`   Distance: ${formatDistance(directions.distance)}`)
    console.log(`   Duration: ${formatDuration(directions.duration)}`)
    console.log(`   Steps: ${directions.steps.length} turn-by-turn instructions`)
    console.log('')

    console.log('🎉 All tests passed!')
    console.log('\n📊 Summary:')
    console.log('- Geocoding: Working ✅')
    console.log('- Places: Working ✅')
    console.log('- Directions: Working ✅')
    console.log('\nReady to integrate with OpenAI! 🚀')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

testMapsAPIs()
