import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { postToLinkedIn, postToLinkedInWithServiceRole } from '@/lib/services/linkedinPosting'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret) {
      console.error('CRON_SECRET environment variable not set')
      return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 })
    }
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Invalid cron authorization header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role client to bypass RLS for cron job
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Debug: Check if we can connect to Supabase
    console.log('Testing Supabase connection with service role...')
    const { data: testData, error: testError } = await supabase
      .from('scheduled_posts')
      .select('count', { count: 'exact', head: true })
    
    if (testError) {
      console.error('Supabase connection test failed:', testError)
    } else {
      console.log('Supabase connection test successful, count:', testData)
    }
    
    // Get current time in UTC
    const now = new Date()
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000) // 5 minutes buffer
    
    console.log(`Processing scheduled posts at ${now.toISOString()} (UTC)`)
    console.log(`Looking for posts scheduled before ${fiveMinutesFromNow.toISOString()} (UTC)`)
    
    // First, let's see ALL scheduled posts (regardless of status)
    console.log('Fetching all scheduled posts (any status)...')
    const { data: allScheduledPostsAnyStatus, error: allPostsAnyStatusError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .order('scheduled_at', { ascending: true })

    if (allPostsAnyStatusError) {
      console.error('Error fetching all scheduled posts (any status):', allPostsAnyStatusError)
    } else {
      console.log(`Found ${allScheduledPostsAnyStatus?.length || 0} total scheduled posts (any status):`)
      allScheduledPostsAnyStatus?.forEach(post => {
        console.log(`- Post ${post.id}: scheduled_at=${post.scheduled_at}, status=${post.status}, user_id=${post.user_id}`)
      })
    }

    // Let's also try a simple count query
    const { count: totalCount, error: countError } = await supabase
      .from('scheduled_posts')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error counting scheduled posts:', countError)
    } else {
      console.log(`Total scheduled posts count: ${totalCount}`)
    }

    // Now check only pending posts
    const { data: allScheduledPosts, error: allPostsError } = await supabase
      .from('scheduled_posts')
      .select(`
        *,
        posts!inner(
          id,
          user_id,
          title,
          hook,
          body,
          call_to_action,
          platform
        )
      `)
      .eq('status', 'pending')
      .order('scheduled_at', { ascending: true })

    if (allPostsError) {
      console.error('Error fetching pending scheduled posts:', allPostsError)
    } else {
      console.log(`Found ${allScheduledPosts?.length || 0} pending scheduled posts:`)
      allScheduledPosts?.forEach(post => {
        console.log(`- Post ${post.id}: scheduled_at=${post.scheduled_at}, status=${post.status}`)
      })
    }
    
    // Find scheduled posts that are due to be posted
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select(`
        *,
        posts!inner(
          id,
          user_id,
          title,
          hook,
          body,
          call_to_action,
          platform
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', fiveMinutesFromNow.toISOString())
      .order('scheduled_at', { ascending: true })

    if (fetchError) {
      console.error('Error fetching scheduled posts:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch scheduled posts' }, { status: 500 })
    }

    console.log(`Found ${scheduledPosts?.length || 0} scheduled posts due for processing`)
    if (scheduledPosts && scheduledPosts.length > 0) {
      scheduledPosts.forEach(post => {
        const scheduledTime = new Date(post.scheduled_at)
        const timeDiff = scheduledTime.getTime() - now.getTime()
        console.log(`- Post ${post.id}: scheduled_at=${post.scheduled_at}, time_diff=${Math.round(timeDiff / 1000 / 60)} minutes`)
      })
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      console.log('No scheduled posts to process')
      return NextResponse.json({ 
        success: true, 
        message: 'No scheduled posts to process',
        processed: 0,
        debug: {
          allScheduledPostsCount: allScheduledPostsAnyStatus?.length || 0,
          pendingScheduledPostsCount: allScheduledPosts?.length || 0,
          currentTime: now.toISOString(),
          cutoffTime: fiveMinutesFromNow.toISOString()
        }
      })
    }

    console.log(`Found ${scheduledPosts.length} scheduled posts to process`)

    let processedCount = 0
    let errorCount = 0

    // Process each scheduled post
    for (const scheduledPost of scheduledPosts) {
      try {
        console.log(`Processing scheduled post ${scheduledPost.id} for user ${scheduledPost.user_id}`)
        
        // Update status to processing
        const { error: updateError } = await supabase
          .from('scheduled_posts')
          .update({ 
            status: 'processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', scheduledPost.id)

        if (updateError) {
          console.error(`Error updating scheduled post ${scheduledPost.id} to processing:`, updateError)
          continue
        }

        const post = scheduledPost.posts
        if (!post) {
          console.error(`Post not found for scheduled post ${scheduledPost.id}`)
          continue
        }

        // Prepare the LinkedIn post content
        const linkedinContent = `${post.hook}\n\n${post.body}${post.call_to_action ? `\n\n${post.call_to_action}` : ''}`

        // Post to LinkedIn using service role client
        const result = await postToLinkedInWithServiceRole(
          {
            text: linkedinContent,
            visibility: 'PUBLIC' // Default to public, could be made configurable
          },
          scheduledPost.user_id,
          supabase
        )

        if (result.success) {
          // Update scheduled post as completed
          const { error: completeError } = await supabase
            .from('scheduled_posts')
            .update({
              status: 'completed',
              linkedin_post_id: result.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', scheduledPost.id)

          if (completeError) {
            console.error(`Error completing scheduled post ${scheduledPost.id}:`, completeError)
          }

          // Update the original post status
          const { error: postUpdateError } = await supabase
            .from('posts')
            .update({
              status: 'published',
              published_at: new Date().toISOString(),
              linkedin_post_id: result.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', post.id)

          if (postUpdateError) {
            console.error(`Error updating post ${post.id} status:`, postUpdateError)
          }

          console.log(`Successfully posted scheduled post ${scheduledPost.id} to LinkedIn`)
          processedCount++
        } else {
          // Mark as failed
          const { error: failError } = await supabase
            .from('scheduled_posts')
            .update({
              status: 'failed',
              error_message: result.error || 'Unknown error',
              updated_at: new Date().toISOString()
            })
            .eq('id', scheduledPost.id)

          if (failError) {
            console.error(`Error marking scheduled post ${scheduledPost.id} as failed:`, failError)
          }

          console.error(`Failed to post scheduled post ${scheduledPost.id}:`, result.error)
          errorCount++
        }
      } catch (error) {
        console.error(`Error processing scheduled post ${scheduledPost.id}:`, error)
        
        // Mark as failed
        const { error: failError } = await supabase
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            updated_at: new Date().toISOString()
          })
          .eq('id', scheduledPost.id)

        if (failError) {
          console.error(`Error marking scheduled post ${scheduledPost.id} as failed:`, failError)
        }

        errorCount++
      }
    }

    console.log(`Cron job completed. Processed: ${processedCount}, Errors: ${errorCount}`)

    return NextResponse.json({
      success: true,
      message: 'Scheduled posts processed',
      processed: processedCount,
      errors: errorCount,
      total: scheduledPosts.length
    })

  } catch (error) {
    console.error('Cron job error:', error)
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
