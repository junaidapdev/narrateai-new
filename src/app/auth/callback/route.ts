import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if this is a new user (Google OAuth)
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_done')
        .eq('id', data.user.id)
        .single()

      // If no profile exists, create one for Google OAuth users
      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email || '',
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
            avatar_url: data.user.user_metadata?.avatar_url || null,
            subscription_status: 'trial',
            trial_minutes_used: 0,
            subscription_plan: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error creating profile:', insertError)
        }
      }

      // Redirect to onboarding for new users, dashboard for existing users
      const redirectUrl = !profile?.onboarding_done ? '/onboarding' : '/dashboard'
      return NextResponse.redirect(`${origin}${redirectUrl}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
