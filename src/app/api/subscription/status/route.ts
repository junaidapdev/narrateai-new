import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's subscription data with all fields
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        subscription_status,
        subscription_id,
        subscription_plan,
        subscription_end_date,
        customer_portal_url,
        lemon_customer_id,
        cancellation_reason,
        cancellation_feedback,
        trial_minutes_used,
        created_at,
        updated_at
      `)
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch subscription data' },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    // Calculate subscription details
    const isActive = profile.subscription_status === 'active'
    const isTrial = profile.subscription_status === 'trial'
    const isCancelled = profile.subscription_status === 'cancelled'
    
    // Calculate days until next billing (if active)
    let daysUntilBilling = null
    if (isActive && profile.subscription_end_date) {
      const endDate = new Date(profile.subscription_end_date)
      const now = new Date()
      const diffTime = endDate.getTime() - now.getTime()
      daysUntilBilling = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        is_active: isActive,
        is_trial: isTrial,
        is_cancelled: isCancelled,
        days_until_billing: daysUntilBilling,
        has_customer_portal: !!profile.customer_portal_url,
        has_cancellation_data: !!(profile.cancellation_reason || profile.cancellation_feedback)
      }
    })

  } catch (error) {
    console.error('Error in subscription status endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
