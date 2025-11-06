import type { Walk } from '@/types/walk'

interface WalkCardProps {
  walk: Walk
}

export function WalkCard({ walk }: WalkCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Walk Name */}
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {walk.name}
      </h3>

      {/* Distance, Duration, Difficulty */}
      <div className="flex items-center gap-4 text-gray-600 mb-3">
        <span className="text-sm">
          {walk.distance_km} km
        </span>
        <span className="text-sm">•</span>
        <span className="text-sm">
          {walk.duration_minutes} min
        </span>
        <span className="text-sm">•</span>
        <span className="text-sm capitalize">
          {walk.difficulty}
        </span>
      </div>

      {/* Notes */}
      {walk.notes && (
        <p className="text-gray-700 text-sm mt-2">
          {walk.notes}
        </p>
      )}
    </div>
  )
}
