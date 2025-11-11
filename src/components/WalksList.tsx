'use client'

import { useOptimistic } from 'react'
import toast from 'react-hot-toast'
import { WalkCard } from './WalkCard'
import type { Walk } from '@/types/walk'

interface WalksListProps {
  initialWalks: Walk[]
  onDelete: (walkId: string) => Promise<void>
}

export function WalksList({ initialWalks, onDelete }: WalksListProps) {
  const [optimisticWalks, removeOptimisticWalk] = useOptimistic(
    initialWalks,
    (currentWalks, walkIdToDelete: string) => {
      return currentWalks.filter(walk => walk.id !== walkIdToDelete)
    }
  )

  async function handleDelete(walkId: string) {
    // Optimistically remove the walk from UI immediately
    removeOptimisticWalk(walkId)
    
    try {
      // Make actual server request in background
      await onDelete(walkId)
      toast.success('Walk deleted successfully')
    } catch (error) {
      // React automatically reverts the optimistic update on error
      toast.error('Failed to delete walk. Please try again.')
      console.error('Failed to delete walk:', error)
    }
  }

  return (
    <div>
      {optimisticWalks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-2">No walks yet</p>
          <p className="text-gray-400">Click "Add Walk" to record your first walk!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {optimisticWalks.map((walk) => (
            <WalkCard
              key={walk.id}
              walk={walk}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
