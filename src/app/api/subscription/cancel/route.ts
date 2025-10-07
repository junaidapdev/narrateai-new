import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CancellationData } from '@/lib/types'

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { reason, feedback }: CancellationData = body

    if (!reason) {
      return NextResponse.json(
        { error: 'Cancellation reason is required' },
        { status: 400 }
      )
    }

    // Get user's subscription data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_id, lemon_customer_id, subscription_status')
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

    // Check if subscription is already cancelled
    if (profile.subscription_status === 'cancelled') {
      return NextResponse.json(
        { error: 'Subscription is already cancelled' },
        { status: 400 }
      )
    }

    // Save cancellation reason and feedback to database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        cancellation_reason: reason,
        cancellation_feedback: feedback || null,
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating subscription:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 }
      )
    }

    // TODO: Integrate with LemonSqueezy API to actually cancel the subscription
    // This would require calling LemonSqueezy's subscription cancellation endpoint
    // For now, we're just updating our database
    
    console.log(`Subscription cancelled for user ${user.id}:`, {
      reason,
      feedback,
      subscription_id: profile.subscription_id,
      lemon_customer_id: profile.lemon_customer_id
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: {
        reason,
        feedback,
        cancelled_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error in subscription cancellation endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
