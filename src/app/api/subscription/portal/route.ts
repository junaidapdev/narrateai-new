import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CustomerPortalResponse } from '@/lib/types'

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

    // Get user's subscription data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('customer_portal_url, lemon_customer_id, subscription_id')
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

    // If we already have a customer portal URL, return it
    if (profile.customer_portal_url) {
      return NextResponse.json({
        url: profile.customer_portal_url,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      } as CustomerPortalResponse)
    }

    // If we have a LemonSqueezy customer ID, we could generate a new portal URL
    // For now, we'll return an error asking user to contact support
    if (!profile.lemon_customer_id) {
      return NextResponse.json(
        { error: 'No billing information found. Please contact support.' },
        { status: 404 }
      )
    }

    // Try to get customer portal URL from LemonSqueezy API
    try {
      const response = await fetch(`https://api.lemonsqueezy.com/v1/customers/${profile.lemon_customer_id}/portal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const portalUrl = data.data.attributes.url
        
        // Update database with portal URL
        await supabase
          .from('profiles')
          .update({ customer_portal_url: portalUrl })
          .eq('id', user.id)
        
        return NextResponse.json({
          url: portalUrl,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        } as CustomerPortalResponse)
      }
    } catch (error) {
      console.error('Error fetching customer portal from LemonSqueezy:', error)
    }

    return NextResponse.json(
      { error: 'Customer portal not available. Please contact support.' },
      { status: 501 }
    )

  } catch (error) {
    console.error('Error in customer portal endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
