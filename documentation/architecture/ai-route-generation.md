# AI-Powered Route Generation Architecture

**Feature:** Custom dog walking route generation using OpenAI + Google Maps APIs

**Created:** November 18, 2025

---

## Overview

This feature allows users to generate personalized, circular dog walking routes based on their preferences (distance, must-visit POIs like cafes, dog-friendly requirements). It combines multiple APIs to create unique routes that don't exist in any standard mapping database.

**The USP:** AI-generated custom routes, not just finding existing trails.

---

## System Architecture

```
User Input:
- Location: "My address, Bradford on Avon"
- Distance: 2km circular
- Must include: Coffee shop stop
- Dog-friendly: Yes
- Off-leash areas preferred
         ↓
┌─────────────────────────────────────┐
│  1. Geocoding API (Google Maps)     │
│                                     │
│  Converts user's text location      │
│  to precise coordinates             │
│                                     │
│  Input: "Bradford on Avon"          │
│  Output: {                          │
│    lat: 51.3462,                    │
│    lng: -2.2517,                    │
│    formattedAddress: "..."          │
│  }                                  │
│                                     │
│  File: src/lib/maps/geocoding.ts    │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  2. Places API (Google Maps)        │
│                                     │
│  Finds real nearby POIs within      │
│  search radius (e.g., 2km)          │
│                                     │
│  Search for:                        │
│  - Parks (type: 'park')             │
│  - Cafes (type: 'cafe')             │
│  - Dog parks (keyword: 'dog park')  │
│  - Trails (type: 'tourist_attraction')│
│                                     │
│  Returns: [                         │
│    {                                │
│      name: "Barton Farm Park",      │
│      location: {lat, lng},          │
│      rating: 4.6,                   │
│      types: ['park'],               │
│      distance_from_start: 0.3km     │
│    },                               │
│    {                                │
│      name: "Riverside Cafe",        │
│      location: {lat, lng},          │
│      rating: 4.2,                   │
│      types: ['cafe', 'restaurant'], │
│      distance_from_start: 0.5km     │
│    },                               │
│    ...                              │
│  ]                                  │
│                                     │
│  File: src/lib/maps/places.ts       │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  3. OpenAI GPT-4o-mini (Route AI)   │
│                                     │
│  AI selects & sequences waypoints   │
│  based on user preferences          │
│                                     │
│  Input Prompt:                      │
│  - Start/end coordinates            │
│  - Desired distance (2km)           │
│  - Must-haves (cafe)                │
│  - Preferences (off-leash)          │
│  - Available POIs (from step 2)     │
│                                     │
│  AI Reasoning:                      │
│  1. User wants 2km circular + cafe  │
│  2. "Riverside Cafe" matches        │
│  3. "Barton Farm Park" has off-leash│
│  4. Sequence efficiently:           │
│     Home → Park → Cafe → Canal      │
│     → Home ≈ 2km                    │
│                                     │
│  Output (JSON):                     │
│  {                                  │
│    "route_name": "Coffee & Canal    │
│                   Loop",            │
│    "waypoints": [                   │
│      {                              │
│        "lat": 51.3462,              │
│        "lng": -2.2517,              │
│        "name": "Start"              │
│      },                             │
│      {                              │
│        "lat": 51.3489,              │
│        "lng": -2.2501,              │
│        "name": "Barton Farm Park"   │
│      },                             │
│      {                              │
│        "lat": 51.3501,              │
│        "lng": -2.2485,              │
│        "name": "Riverside Cafe"     │
│      },                             │
│      {                              │
│        "lat": 51.3470,              │
│        "lng": -2.2495,              │
│        "name": "Kennet Canal"       │
│      },                             │
│      {                              │
│        "lat": 51.3462,              │
│        "lng": -2.2517,              │
│        "name": "End"                │
│      }                              │
│    ],                               │
│    "estimated_distance": "2.1km",   │
│    "highlights": "Off-leash park,   │
│                   dog-friendly cafe" │
│  }                                  │
│                                     │
│  File: src/lib/ai/openai.ts         │
│  (enhanced generateWalkRoute fn)    │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  4. Directions API (Google Maps)    │
│                                     │
│  Converts AI's waypoints into       │
│  actual walking route with streets  │
│                                     │
│  Input:                             │
│  - Origin: 51.3462, -2.2517         │
│  - Destination: 51.3462, -2.2517    │
│  - Waypoints: [park, cafe, canal]   │
│  - Mode: walking                    │
│                                     │
│  What it calculates:                │
│  - Exact distance: 2.03km           │
│  - Duration: 28 minutes             │
│  - Turn-by-turn directions:         │
│    "Head north on Bridge St..."     │
│  - Polyline (route shape for map)   │
│                                     │
│  Output:                            │
│  {                                  │
│    distance: 2030, // meters        │
│    duration: 1680, // seconds       │
│    steps: [...], // turn-by-turn    │
│    overview_polyline: "encoded..."  │
│  }                                  │
│                                     │
│  File: src/lib/maps/directions.ts   │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  5. Google Maps Display (React)     │
│                                     │
│  Interactive map component showing: │
│  - Route drawn as polyline          │
│  - Waypoint markers (park, cafe)    │
│  - Distance/duration info           │
│  - "Save as Walk" button            │
│                                     │
│  Technologies:                      │
│  - @react-google-maps/api (or)      │
│  - Google Maps Embed API            │
│                                     │
│  Component:                         │
│  <RouteMap                          │
│    route={directionsResult}         │
│    waypoints={aiWaypoints}          │
│  />                                 │
│                                     │
│  File: src/components/RouteMap.tsx  │
└─────────────────────────────────────┘
```

---

## API Responsibilities Summary

| API | What It Does | What It Doesn't Do |
|-----|--------------|-------------------|
| **Geocoding** | Text → Coordinates | ❌ Find nearby places |
| **Places** | Find real POIs nearby | ❌ Calculate routes |
| **OpenAI** | Smart waypoint selection | ❌ Know exact distances |
| **Directions** | Waypoints → Walking route | ❌ Choose which places to visit |
| **Maps Display** | Visualize the route | ❌ Generate route logic |

---

## Key Design Decisions

### Why OpenAI Instead of Custom Algorithm?

**OpenAI Approach:**
```typescript
// Simple, flexible, natural language
const prompt = `Create a 2km dog walk with cafe stop, avoid busy roads`
const route = await generateRoute(prompt)
```

**Custom Algorithm Approach:**
```typescript
// Complex, rigid, hard to maintain
const parks = await findParks(coords, 2000)
const cafes = await findCafes(coords, 2000)
const combinations = generateAllCombinations(parks, cafes)
const filtered = combinations.filter(c => 
  c.distance >= 1800 && c.distance <= 2200 &&
  c.hasCafe && c.avoidBusyRoads // How to detect busy roads??
)
const optimized = optimizeRouteOrder(filtered)
```

**Winner:** OpenAI - more flexible, less code, handles edge cases naturally

### Why Not Use Google's Built-in Route Planner?

Google Maps can optimize multi-stop routes (A → B → C → A), but:
- ❌ Can't generate routes based on preferences ("dog-friendly")
- ❌ Requires user to manually choose all waypoints
- ❌ No personalization beyond "fastest/shortest"
- ✅ **Our AI approach:** "I want 2km, dog-friendly, via cafe" → generates custom route

---

## Cost Analysis (Per Route Generation)

| Service | Cost | Frequency |
|---------|------|-----------|
| Geocoding API | Free (40k/month free tier) | 1 per route |
| Places API | $0.032 | 3-4 searches per route |
| OpenAI GPT-4o-mini | $0.001 | 1 per route |
| Directions API | $0.005 | 1 per route |
| **Total per route** | **~$0.04** | - |

**Monthly estimate (portfolio):**
- 50 routes/month = $2.00
- With caching (same location): ~$1.00/month

**Production considerations:**
- Rate limiting: 5 routes/hour/user
- Cache by location + preferences (24hr)
- Feature flag for emergency disable

---

## Data Flow Example

**User request:**
> "Generate a 2km circular walk from Bradford on Avon town center, must include a dog-friendly cafe, prefer off-leash areas"

**Step-by-step execution:**

1. **Geocoding:** "Bradford on Avon town center" → `51.3462, -2.2517`

2. **Places API (3 searches):**
   - Parks: Barton Farm Park, St. Margaret's Hall
   - Cafes: Riverside Cafe, The Lock Inn Cafe
   - Dog parks: Bradford Dog Exercise Area

3. **OpenAI prompt:**
   ```
   Create circular 2km dog walk from 51.3462,-2.2517
   Must include dog-friendly cafe
   Prefer off-leash areas
   
   Available places:
   - Barton Farm Park (0.3km, off-leash area)
   - Riverside Cafe (0.5km, dog-friendly)
   - Kennet Canal Towpath (0.2km, popular)
   
   Return waypoints as JSON
   ```

4. **OpenAI response:**
   ```json
   {
     "waypoints": [
       {"lat": 51.3462, "lng": -2.2517, "name": "Start"},
       {"lat": 51.3489, "lng": -2.2501, "name": "Barton Farm Park"},
       {"lat": 51.3501, "lng": -2.2485, "name": "Riverside Cafe"},
       {"lat": 51.3462, "lng": -2.2517, "name": "End"}
     ]
   }
   ```

5. **Directions API:** Converts waypoints → `2.03km walking route with turn-by-turn`

6. **Display:** Map shows route + markers

---

## Future Enhancements

- [ ] **Weather-aware routing** - Suggest shaded routes in summer
- [ ] **Real-time crowd data** - Avoid busy parks
- [ ] **Terrain preferences** - Flat vs hilly routes
- [ ] **Multi-dog support** - Routes with multiple off-leash zones
- [ ] **Save favorite routes** - Store in database for reuse
- [ ] **Share routes** - Generate shareable links
- [ ] **Route ratings** - User feedback on AI suggestions

---

## Files to Create

1. `src/lib/maps/geocoding.ts` - Location text → coordinates
2. `src/lib/maps/places.ts` - Find nearby POIs
3. `src/lib/maps/directions.ts` - Waypoints → route
4. `src/lib/ai/openai.ts` - Update with route generation
5. `src/components/RouteMap.tsx` - Display map
6. `src/app/(app)/recommendations/page.tsx` - Update UI with preferences form
7. `src/types/maps.ts` - TypeScript interfaces

---

*Last updated: November 18, 2025*
