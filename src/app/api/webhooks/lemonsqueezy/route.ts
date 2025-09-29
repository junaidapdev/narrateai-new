import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-signature')
    
    console.log('Webhook received:', { 
      hasSignature: !!signature, 
      bodyLength: body.length,
      headers: Object.fromEntries(request.headers.entries())
    })
    
    // Verify webhook signature
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('Lemon Squeezy webhook secret not configured')
      // For testing, allow webhooks without signature verification
      console.log('Proceeding without signature verification (testing mode)')
    } else if (signature) {
      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')

      if (signature !== `sha256=${expectedSignature}`) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(body)
    console.log('Lemon Squeezy webhook received:', {
      type: event.type,
      data: event.data
    })

    const supabase = createClient()

    switch (event.type) {
      case 'order_created':
        await handleOrderCreated(event.data, supabase)
        break
      case 'subscription_created':
        await handleSubscriptionCreated(event.data, supabase)
        break
      case 'subscription_updated':
        await handleSubscriptionUpdated(event.data, supabase)
        break
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(event.data, supabase)
        break
      case 'subscription_resumed':
        await handleSubscriptionResumed(event.data, supabase)
        break
      case 'subscription_expired':
        await handleSubscriptionExpired(event.data, supabase)
        break
      default:
        console.log('Unhandled webhook event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleOrderCreated(order: any, supabase: any) {
  console.log('Order created:', order.id)
  console.log('Order data:', JSON.stringify(order, null, 2))
  
  try {
    // Find user by email
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', order.user_email)
      .single()

    if (error) {
      console.error('Error finding user for order:', error)
      return
    }

    if (!profile) {
      console.error('User not found for order:', order.user_email)
      return
    }

    console.log('Found user profile for order:', profile.id, profile.email)

    // If this is a subscription order, we'll wait for the subscription_created event
    // But we can log it for debugging
    if (order.subscription_id) {
      console.log('Order is for subscription:', order.subscription_id)
    }
  } catch (error) {
    console.error('Error in handleOrderCreated:', error)
  }
}

async function handleSubscriptionCreated(subscription: any, supabase: any) {
  console.log('Subscription created:', subscription.id)
  console.log('Subscription data:', JSON.stringify(subscription, null, 2))
  
  try {
    // Find user by email
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', subscription.user_email)
      .single()

    if (error) {
      console.error('Error finding user:', error)
      return
    }

    if (!profile) {
      console.error('User not found for subscription:', subscription.user_email)
      return
    }

    console.log('Found user profile:', profile.id, profile.email)

    // Determine subscription plan
    const plan = subscription.variant_name?.toLowerCase().includes('yearly') ? 'yearly' : 'monthly'
    
    // Update user subscription status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_id: subscription.id,
        subscription_plan: plan,
        subscription_end_date: subscription.renews_at,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Error updating subscription:', updateError)
      return
    }

    console.log('Successfully activated subscription for user:', profile.email, 'Plan:', plan)
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error)
  }
}

async function handleSubscriptionUpdated(subscription: any, supabase: any) {
  console.log('Subscription updated:', subscription.id)
  
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      subscription_end_date: subscription.renews_at,
      updated_at: new Date().toISOString()
    })
    .eq('subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handleSubscriptionCancelled(subscription: any, supabase: any) {
  console.log('Subscription cancelled:', subscription.id)
  
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'cancelled',
      subscription_end_date: subscription.ends_at,
      updated_at: new Date().toISOString()
    })
    .eq('subscription_id', subscription.id)

  if (error) {
    console.error('Error cancelling subscription:', error)
  }
}

async function handleSubscriptionResumed(subscription: any, supabase: any) {
  console.log('Subscription resumed:', subscription.id)
  
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      subscription_end_date: subscription.renews_at,
      updated_at: new Date().toISOString()
    })
    .eq('subscription_id', subscription.id)

  if (error) {
    console.error('Error resuming subscription:', error)
  }
}

async function handleSubscriptionExpired(subscription: any, supabase: any) {
  console.log('Subscription expired:', subscription.id)
  
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'expired',
      updated_at: new Date().toISOString()
    })
    .eq('subscription_id', subscription.id)

  if (error) {
    console.error('Error expiring subscription:', error)
  }
}
