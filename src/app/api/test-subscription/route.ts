import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Test subscription endpoint called')
    
    const { email, subscription_plan = 'monthly' } = await request.json()
    console.log('Request data:', { email, subscription_plan })
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = await createClient()
    console.log('Supabase client created')

    // First, let's get all profiles to see what's in the database
    console.log('Getting all profiles to debug...')
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)

    console.log('All profiles in database:', allProfiles)
    
    // Now try to find the user by email (case insensitive)
    console.log('Looking for user with email:', email)
    let { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', email) // Use ilike for case-insensitive search
      .maybeSingle()

    console.log('Find user result:', { profile, findError })

    if (!profile) {
      console.error('User not found for email:', email)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('Found user profile:', profile.id, profile.email)

    // Update subscription status
    console.log('Updating subscription for user:', profile.id)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: subscription_plan,
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    console.log('Update result:', { updateError })

    if (updateError) {
      console.error('Error updating subscription:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update subscription', 
        details: updateError.message 
      }, { status: 500 })
    }

    console.log('Successfully updated subscription for:', email)
    return NextResponse.json({ 
      success: true, 
      message: `Subscription activated for ${email}`,
      plan: subscription_plan,
      userId: profile.id
    })
  } catch (error) {
    console.error('Test subscription error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}