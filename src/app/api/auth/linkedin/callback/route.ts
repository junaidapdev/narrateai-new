import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    console.log('LinkedIn callback received:', { 
      code: !!code, 
      state, 
      error,
      url: request.url,
      searchParams: Object.fromEntries(new URL(request.url).searchParams)
    })
    
    if (error) {
      console.error('LinkedIn OAuth error:', error)
      return NextResponse.redirect(new URL('/settings?linkedin_error=access_denied', request.url))
    }
    
    if (!code || !state) {
      console.error('Missing code or state parameter')
      return NextResponse.redirect(new URL('/settings?linkedin_error=missing_parameters', request.url))
    }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user || user.id !== state) {
      console.error('User authentication failed or state mismatch')
      return NextResponse.redirect(new URL('/signin', request.url))
    }

    console.log('Exchanging code for access token...')

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/linkedin/callback`,
      }),
    })

    const tokenData = await tokenResponse.json()
    
    if (!tokenData.access_token) {
      console.error('Failed to get access token:', tokenData)
      return NextResponse.redirect(new URL('/settings?linkedin_error=token_failed', request.url))
    }

    console.log('Access token received, fetching profile...')

        // Get LinkedIn profile data using the new API
        const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        })

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text()
      console.error('Failed to get LinkedIn profile:', {
        status: profileResponse.status,
        statusText: profileResponse.statusText,
        error: errorText
      })
      return NextResponse.redirect(new URL('/settings?linkedin_error=profile_failed', request.url))
    }

    const profileData = await profileResponse.json()
    console.log('Profile data received:', profileData)
    
    // Store LinkedIn connection in database
    const { error: insertError } = await supabase
      .from('linkedin_connections')
      .upsert({
        user_id: user.id,
        linkedin_user_id: profileData.sub, // 'sub' is the user ID in the new API
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        token_expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
        linkedin_profile_data: profileData,
        is_active: true,
      })

    if (insertError) {
      console.error('Error storing LinkedIn connection:', insertError)
      return NextResponse.redirect(new URL('/settings?linkedin_error=storage_failed', request.url))
    }

    console.log('LinkedIn connection stored successfully')
    return NextResponse.redirect(new URL('/settings?linkedin_success=connected', request.url))
  } catch (error) {
    console.error('LinkedIn callback error:', error)
    return NextResponse.redirect(new URL('/settings?linkedin_error=callback_failed', request.url))
  }
}
