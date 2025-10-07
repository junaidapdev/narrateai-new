import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the current request URL to build the cron endpoint URL
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`
    const cronSecret = process.env.CRON_SECRET
    
    console.log('Triggering cron job with:', {
      baseUrl,
      cronSecret: cronSecret ? 'SET' : 'NOT SET',
      endpoint: `${baseUrl}/api/cron/process-scheduled-posts`
    })
    
    const response = await fetch(`${baseUrl}/api/cron/process-scheduled-posts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Cron job triggered manually',
      cronResponse: data,
      status: response.status,
      debug: {
        baseUrl,
        cronSecretSet: !!cronSecret,
        endpoint: `${baseUrl}/api/cron/process-scheduled-posts`
      }
    })

  } catch (error) {
    console.error('Error triggering cron job:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to trigger cron job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
