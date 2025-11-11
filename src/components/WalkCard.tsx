'use client'

import { useState, useTransition } from 'react'
import type { Walk } from '@/types/walk'
import Link from 'next/link'

interface WalkCardProps {
  walk: Walk
  onDelete?: (walkId: string) => Promise<void> | void
}

export function WalkCard({ walk, onDelete }: WalkCardProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${walk.name}"? This cannot be undone.`)) {
      if (onDelete) {
        startTransition(async () => {
          await onDelete(walk.id)
        })
      }
    }
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all ${
      isPending ? 'opacity-50 pointer-events-none' : ''
    }`}>
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

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
        <Link
          href={`/walks/${walk.id}/edit`}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Edit
        </Link>
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
