import AddWalkForm from '@/components/AddWalkForm'
import type { CreateWalkInput } from '@/types/walk'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function NewWalkPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const handleSubmit = async (walkData: CreateWalkInput) => {
    'use server'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('You must be logged in to add a walk')
    }

    // Insert the walk with the authenticated user's ID
    const { data, error } = await supabase
      .from('walks')
      .insert({
        ...walkData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving walk:', error)
      throw new Error('Failed to save walk: ' + error.message)
    }

    console.log('Walk saved successfully:', data)

    // Redirect to home for now
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add a New Walk</h1>
          <p className="mt-2 text-gray-600">
            Save details about a dog walk route so you can refer to it later.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <AddWalkForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}
