import { NextRequest, NextResponse } from 'next/server'
import { withCompleteSecurity } from '@/lib/middleware/security'
import { authSchemas } from '@/lib/validations'
import { env } from '@/lib/env'

// Example API route demonstrating all security measures
export async function POST(request: NextRequest) {
  // Apply complete security middleware
  const securityResult = await withCompleteSecurity(
    request,
    authSchemas.signup, // Validate request body
    {
      rateLimit: true,           // Enable rate limiting
      validateBody: true,        // Validate request body
      validateSize: true,        // Validate request size
      validateContentType: true, // Validate content type
      maxSize: 1024 * 1024,      // 1MB max size
      allowedContentTypes: ['application/json'],
      enableCors: true,          // Enable CORS
      enableLogging: true        // Enable request logging
    }
  )

  if (!securityResult.success) {
    return securityResult.response
  }

  try {
    // Your business logic here
    const { email, password, fullName } = securityResult.data!

    // Simulate some processing
    await new Promise(resolve => setTimeout(resolve, 100))

    // Return success response
    const response = NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: {
        email,
        fullName,
        id: 'user-123',
        createdAt: new Date().toISOString()
      }
    })

    // Add security headers to response
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')

    return response

  } catch (error) {
    console.error('API Error:', error)
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: env.NODE_ENV === 'production' 
          ? 'Something went wrong. Please try again later.'
          : error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Example GET route with query validation
export async function GET(request: NextRequest) {
  // Apply security middleware (no body validation for GET)
  const securityResult = await withCompleteSecurity(request, undefined, {
    rateLimit: true,
    validateBody: false,
    validateSize: false,
    validateContentType: false,
    enableCors: true,
    enableLogging: true
  })

  if (!securityResult.success) {
    return securityResult.response
  }

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'

    // Your business logic here
    const data = {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 100,
      items: []
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('API Error:', error)
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Something went wrong. Please try again later.'
      },
      { status: 500 }
    )
  }
}
