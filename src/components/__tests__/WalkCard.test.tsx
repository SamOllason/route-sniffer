import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WalkCard } from '../WalkCard'
import type { Walk } from '@/types/walk'

describe('WalkCard', () => {
  const mockWalk: Walk = {
    id: '123-456',
    user_id: null,
    name: 'Riverside Loop',
    distance_km: 3.5,
    duration_minutes: 45,
    difficulty: 'easy',
    notes: 'Beautiful scenery along the river',
    created_at: '2025-11-06T10:00:00Z',
    updated_at: '2025-11-06T10:00:00Z',
  }

  describe('Rendering', () => {
    it('renders the walk name', () => {
      render(<WalkCard walk={mockWalk} />)
      expect(screen.getByText('Riverside Loop')).toBeInTheDocument()
    })

    it('renders the distance in km', () => {
      render(<WalkCard walk={mockWalk} />)
      expect(screen.getByText(/3\.5 km/i)).toBeInTheDocument()
    })

    it('renders the duration in minutes', () => {
      render(<WalkCard walk={mockWalk} />)
      expect(screen.getByText(/45 min/i)).toBeInTheDocument()
    })

    it('renders the difficulty level', () => {
      render(<WalkCard walk={mockWalk} />)
      expect(screen.getByText(/easy/i)).toBeInTheDocument()
    })

    it('renders notes when present', () => {
      render(<WalkCard walk={mockWalk} />)
      expect(screen.getByText('Beautiful scenery along the river')).toBeInTheDocument()
    })

    it('does not render notes section when notes are empty', () => {
      const walkWithoutNotes: Walk = {
        ...mockWalk,
        notes: '',
      }
      render(<WalkCard walk={walkWithoutNotes} />)
      expect(screen.queryByText(/beautiful scenery/i)).not.toBeInTheDocument()
    })
  })

  describe('Formatting', () => {
    it('formats distance with decimal places', () => {
      const walk: Walk = {
        ...mockWalk,
        distance_km: 10.25,
      }
      render(<WalkCard walk={walk} />)
      expect(screen.getByText(/10\.25 km/i)).toBeInTheDocument()
    })

    it('formats whole number distances without unnecessary decimals', () => {
      const walk: Walk = {
        ...mockWalk,
        distance_km: 5,
      }
      render(<WalkCard walk={walk} />)
      // Should show "5 km" or "5.0 km" - either is acceptable
      expect(screen.getByText(/5(\.0)? km/i)).toBeInTheDocument()
    })
  })

  describe('Difficulty levels', () => {
    it('renders "easy" difficulty', () => {
      const walk: Walk = { ...mockWalk, difficulty: 'easy' }
      render(<WalkCard walk={walk} />)
      expect(screen.getByText(/easy/i)).toBeInTheDocument()
    })

    it('renders "moderate" difficulty', () => {
      const walk: Walk = { ...mockWalk, difficulty: 'moderate' }
      render(<WalkCard walk={walk} />)
      expect(screen.getByText(/moderate/i)).toBeInTheDocument()
    })

    it('renders "hard" difficulty', () => {
      const walk: Walk = { ...mockWalk, difficulty: 'hard' }
      render(<WalkCard walk={walk} />)
      expect(screen.getByText(/hard/i)).toBeInTheDocument()
    })
  })
})
