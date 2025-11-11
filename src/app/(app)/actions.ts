'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function deleteWalkAction(walkId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Delete the walk (RLS ensures user can only delete their own walks)
  const { error } = await supabase
    .from('walks')
    .delete()
    .eq('id', walkId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('Failed to delete walk')
  }

  // Revalidate the home page to show updated list
  revalidatePath('/')
}
