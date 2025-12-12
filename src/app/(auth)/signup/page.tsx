import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignupForm } from '@/components/SignupForm'

export default function SignupPage() {
  async function signupAction(formData: FormData) {
    'use server'

    const email = formData.get('email')?.toString() ?? ''
    const password = formData.get('password')?.toString() ?? ''

    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    // Redirect to AI recommendations - the main feature we want users to experience!
    redirect('/recommendations')
  }

  return <SignupForm onSignup={signupAction} />
}
