import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }

    // LinkedIn OAuth parameters
    const clientId = process.env.LINKEDIN_CLIENT_ID
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/linkedin/callback`
    const state = user.id // Use user ID as state for security
    
    // Debug logging
    console.log('LinkedIn OAuth Debug:')
    console.log('Client ID:', clientId)
    console.log('Redirect URI:', redirectUri)
    console.log('State:', state)
    console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
    console.log('All environment variables:', {
      LINKEDIN_CLIENT_ID: !!process.env.LINKEDIN_CLIENT_ID,
      LINKEDIN_CLIENT_SECRET: !!process.env.LINKEDIN_CLIENT_SECRET,
      LINKEDIN_REDIRECT_URI: process.env.LINKEDIN_REDIRECT_URI,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
    })
    
    if (!clientId) {
      console.error('LINKEDIN_CLIENT_ID is not set!')
      return NextResponse.json({ 
        error: 'LinkedIn Client ID not configured',
        debug: {
          LINKEDIN_CLIENT_ID: !!process.env.LINKEDIN_CLIENT_ID,
          LINKEDIN_CLIENT_SECRET: !!process.env.LINKEDIN_CLIENT_SECRET,
          LINKEDIN_REDIRECT_URI: process.env.LINKEDIN_REDIRECT_URI,
          NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
        }
      }, { status: 500 })
    }
    
        const scope = 'openid profile email w_member_social'
    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`
    
    console.log('LinkedIn Auth URL:', linkedinAuthUrl)
    
    return NextResponse.redirect(linkedinAuthUrl)
  } catch (error) {
    console.error('LinkedIn connect error:', error)
    return NextResponse.json({ error: 'Failed to initiate LinkedIn connection' }, { status: 500 })
  }
}
