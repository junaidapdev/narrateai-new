import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Test webhook endpoint called')
    
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())
    
    console.log('Test webhook received:', {
      body: body.substring(0, 200) + '...',
      headers: headers
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test webhook received successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test webhook error:', error)
    return NextResponse.json({ 
      error: 'Test webhook failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Test webhook endpoint is working',
    timestamp: new Date().toISOString()
  })
}
