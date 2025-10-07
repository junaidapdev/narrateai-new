import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { postToLinkedIn, getLinkedInProfile, hasLinkedInConnection } from '@/lib/services/linkedinPosting'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { text, visibility = 'PUBLIC', postId } = body

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Post text is required' },
        { status: 400 }
      )
    }

    if (text.length > 3000) {
      return NextResponse.json(
        { error: 'Post text is too long (max 3000 characters)' },
        { status: 400 }
      )
    }

    // Check if user has LinkedIn connection
    const hasConnection = await hasLinkedInConnection(user.id)
    if (!hasConnection) {
      return NextResponse.json(
        { error: 'LinkedIn account not connected. Please connect your LinkedIn account first.' },
        { status: 400 }
      )
    }

    // Post to LinkedIn
    const result = await postToLinkedIn(
      {
        text: text.trim(),
        visibility: visibility as 'PUBLIC' | 'CONNECTIONS'
      },
      user.id
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to post to LinkedIn' },
        { status: 500 }
      )
    }

    // If a postId was provided, update the post in our database
    if (postId) {
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          linkedin_post_id: result.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Failed to update post in database:', updateError)
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      linkedinPostId: result.id,
      message: 'Successfully posted to LinkedIn'
    })

  } catch (error) {
    console.error('LinkedIn posting API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Get LinkedIn profile information
    const result = await getLinkedInProfile(user.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to get LinkedIn profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: result.profile
    })

  } catch (error) {
    console.error('LinkedIn profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
