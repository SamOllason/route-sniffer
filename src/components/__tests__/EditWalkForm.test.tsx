import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditWalkForm } from '../EditWalkForm'
import type { Walk } from '@/types/walk'

describe('EditWalkForm', () => {
  const mockWalk: Walk = {
    id: '123-456',
    user_id: 'user-123',
    name: 'Riverside Loop',
    distance_km: 3.5,
    duration_minutes: 45,
    difficulty: 'easy',
    notes: 'Beautiful scenery along the river',
    created_at: '2025-11-06T10:00:00Z',
    updated_at: '2025-11-06T10:00:00Z',
  }

  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  describe('Form Pre-population', () => {
    it('pre-populates the walk name field', () => {
      render(<EditWalkForm walk={mockWalk} onSubmit={mockOnSubmit} />)
      const nameInput = screen.getByLabelText(/walk name/i)
      expect(nameInput).toHaveValue('Riverside Loop')
    })

    it('pre-populates the distance field', () => {
      render(<EditWalkForm walk={mockWalk} onSubmit={mockOnSubmit} />)
      const distanceInput = screen.getByLabelText(/distance/i)
      expect(distanceInput).toHaveValue(3.5)
    })

    it('pre-populates the duration field', () => {
      render(<EditWalkForm walk={mockWalk} onSubmit={mockOnSubmit} />)
      const durationInput = screen.getByLabelText(/duration/i)
      expect(durationInput).toHaveValue(45)
    })

    it('pre-populates the difficulty field', () => {
      render(<EditWalkForm walk={mockWalk} onSubmit={mockOnSubmit} />)
      const difficultySelect = screen.getByLabelText(/difficulty/i)
      expect(difficultySelect).toHaveValue('easy')
    })

    it('pre-populates the notes field', () => {
      render(<EditWalkForm walk={mockWalk} onSubmit={mockOnSubmit} />)
      const notesInput = screen.getByLabelText(/notes/i)
      expect(notesInput).toHaveValue('Beautiful scenery along the river')
    })
  })

  describe('Form Submission', () => {
    it('renders an update button', () => {
      render(<EditWalkForm walk={mockWalk} onSubmit={mockOnSubmit} />)
      expect(screen.getByRole('button', { name: /update walk/i })).toBeInTheDocument()
    })

    it('calls onSubmit with updated data when form is submitted', async () => {
      const user = userEvent.setup()
      render(<EditWalkForm walk={mockWalk} onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/walk name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Walk Name')

      const submitButton = screen.getByRole('button', { name: /update walk/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      })

      const submittedData = mockOnSubmit.mock.calls[0][0]
      expect(submittedData.get('name')).toBe('Updated Walk Name')
    })

    it('allows updating distance', async () => {
      const user = userEvent.setup()
      render(<EditWalkForm walk={mockWalk} onSubmit={mockOnSubmit} />)

      const distanceInput = screen.getByLabelText(/distance/i)
      await user.clear(distanceInput)
      await user.type(distanceInput, '5.2')

      const submitButton = screen.getByRole('button', { name: /update walk/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      })

      const submittedData = mockOnSubmit.mock.calls[0][0]
      expect(submittedData.get('distance_km')).toBe('5.2')
    })
  })

  describe('Validation', () => {
    it('shows error when name is empty', async () => {
      const user = userEvent.setup()
      render(<EditWalkForm walk={mockWalk} onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/walk name/i)
      await user.clear(nameInput)

      const submitButton = screen.getByRole('button', { name: /update walk/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/walk name is required/i)).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('shows error when distance is 0 or negative', async () => {
      const user = userEvent.setup()
      render(<EditWalkForm walk={mockWalk} onSubmit={mockOnSubmit} />)

      const distanceInput = screen.getByLabelText(/distance/i)
      await user.clear(distanceInput)
      await user.type(distanceInput, '0')

      const submitButton = screen.getByRole('button', { name: /update walk/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/distance must be greater than 0/i)).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('disables button when submitting', async () => {
      const user = userEvent.setup()
      mockOnSubmit.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<EditWalkForm walk={mockWalk} onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByRole('button', { name: /update walk/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })

    it('shows loading text when submitting', async () => {
      const user = userEvent.setup()
      mockOnSubmit.mockImplementation(() => new Promise(() => {}))

      render(<EditWalkForm walk={mockWalk} onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByRole('button', { name: /update walk/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/updating/i)).toBeInTheDocument()
      })
    })
  })

  describe('Cancel Button', () => {
    it('renders a cancel link', () => {
      render(<EditWalkForm walk={mockWalk} onSubmit={mockOnSubmit} />)
      const cancelLink = screen.getByRole('link', { name: /cancel/i })
      expect(cancelLink).toBeInTheDocument()
    })

    it('cancel link navigates back to home', () => {
      render(<EditWalkForm walk={mockWalk} onSubmit={mockOnSubmit} />)
      const cancelLink = screen.getByRole('link', { name: /cancel/i })
      expect(cancelLink).toHaveAttribute('href', '/')
    })
  })
})
