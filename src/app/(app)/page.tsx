import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { WalksList } from '@/components/WalksList'
import { deleteWalkAction } from './actions'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch only the current user's walks
  const { data: walks, error } = await supabase
    .from('walks')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header - Not Sticky, Scrolls Naturally */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          🐕 My Walks
        </h1>
        <Link
          href="/walks/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Walk
        </Link>
      </div>

      {/* Content */}
      <div>
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            Error loading walks. Please try again later.
          </div>
        )}

        {/* Walks List with Optimistic Updates */}
        {!error && walks && (
          <WalksList initialWalks={walks} onDelete={deleteWalkAction} />
        )}
      </div>
    </div>
  )
}
