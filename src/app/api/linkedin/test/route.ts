import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hasLinkedInConnection, getLinkedInProfile, validateToken } from '@/lib/services/linkedinPosting'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has LinkedIn connection
    const hasConnection = await hasLinkedInConnection(user.id)
    if (!hasConnection) {
      return NextResponse.json({
        success: false,
        message: 'No LinkedIn connection found',
        hasConnection: false
      })
    }

    // Get LinkedIn profile
    const profileResult = await getLinkedInProfile(user.id)
    
    if (!profileResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Failed to get LinkedIn profile',
        error: profileResult.error,
        hasConnection: true
      })
    }

    // Get the connection details to test token validation
    const { data: connection } = await supabase
      .from('linkedin_connections')
      .select('access_token, token_expires_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    let tokenValid = false
    if (connection?.access_token) {
      tokenValid = await validateToken(connection.access_token)
    }

    return NextResponse.json({
      success: true,
      message: 'LinkedIn connection is working',
      hasConnection: true,
      profile: profileResult.profile,
      tokenValid,
      tokenExpiresAt: connection?.token_expires_at
    })

  } catch (error) {
    console.error('LinkedIn test API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
