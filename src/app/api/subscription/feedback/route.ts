import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { feedback } = body

    if (!feedback || feedback.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feedback is required' },
        { status: 400 }
      )
    }

    if (feedback.length > 1000) {
      return NextResponse.json(
        { error: 'Feedback is too long (max 1000 characters)' },
        { status: 400 }
      )
    }

    // Update user's cancellation feedback
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        cancellation_feedback: feedback.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating cancellation feedback:', updateError)
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      )
    }

    console.log(`Cancellation feedback saved for user ${user.id}:`, feedback)

    return NextResponse.json({
      success: true,
      message: 'Feedback saved successfully',
      data: {
        feedback: feedback.trim(),
        saved_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error in feedback endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
