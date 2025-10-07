import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, getRateLimitType } from './rate-limit'
import { withValidation, withSizeValidation, withContentTypeValidation } from './validation'
import { z } from 'zod'
import { env } from '@/lib/env'

// Security middleware that combines all security measures
export async function withSecurity<T>(
  request: NextRequest,
  bodySchema?: z.ZodSchema<T>,
  options: {
    rateLimit?: boolean
    validateBody?: boolean
    validateSize?: boolean
    validateContentType?: boolean
    maxSize?: number
    allowedContentTypes?: string[]
  } = {}
): Promise<{
  success: true
  data?: T
} | {
  success: false
  response: NextResponse
}> {
  const {
    rateLimit = true,
    validateBody = true,
    validateSize = true,
    validateContentType = true,
    maxSize = 1024 * 1024, // 1MB
    allowedContentTypes = ['application/json']
  } = options

  // 1. Rate limiting
  if (rateLimit) {
    const rateLimitType = getRateLimitType(request)
    const rateLimitResponse = await withRateLimit(request, rateLimitType)
    
    if (rateLimitResponse) {
      return { success: false, response: rateLimitResponse }
    }
  }

  // 2. Content type validation
  if (validateContentType) {
    const contentTypeResult = await withContentTypeValidation(request, allowedContentTypes)
    if (!contentTypeResult.success) {
      return contentTypeResult
    }
  }

  // 3. Request size validation
  if (validateSize) {
    const sizeResult = await withSizeValidation(request, maxSize)
    if (!sizeResult.success) {
      return sizeResult
    }
  }

  // 4. Body validation
  if (validateBody && bodySchema) {
    const bodyResult = await withValidation(request, bodySchema)
    if (!bodyResult.success) {
      return bodyResult
    }
    
    return { success: true, data: bodyResult.data }
  }

  return { success: true }
}

// Security headers middleware
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Add HSTS in production
  if (env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  // Add CSP header
  response.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://*.lemonsqueezy.com https://api.openai.com https://api.assemblyai.com https://api.linkedin.com",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '))
  
  return response
}

// CORS middleware
export function addCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin')
  const allowedOrigins = env.NODE_ENV === 'production' 
    ? ['https://www.trynarrate.com'] 
    : ['http://localhost:3000', 'https://localhost:3000']
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}

// Request logging middleware
export function logRequest(request: NextRequest, response: NextResponse): void {
  if (env.NODE_ENV === 'development') {
    const { method, url } = request
    const { status } = response
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'
    
    console.log(`${method} ${url} - ${status} - IP: ${ip} - UA: ${userAgent}`)
  }
}

// Error handling middleware
export function handleError(error: unknown, request: NextRequest): NextResponse {
  console.error('API Error:', error)
  
  // Don't expose internal errors in production
  if (env.NODE_ENV === 'production') {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Something went wrong. Please try again later.'
      },
      { status: 500 }
    )
  }
  
  // In development, show more details
  return NextResponse.json(
    {
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    },
    { status: 500 }
  )
}

// Complete security middleware
export async function withCompleteSecurity<T>(
  request: NextRequest,
  bodySchema?: z.ZodSchema<T>,
  options: {
    rateLimit?: boolean
    validateBody?: boolean
    validateSize?: boolean
    validateContentType?: boolean
    maxSize?: number
    allowedContentTypes?: string[]
    enableCors?: boolean
    enableLogging?: boolean
  } = {}
): Promise<{
  success: true
  data?: T
  response: NextResponse
} | {
  success: false
  response: NextResponse
}> {
  const {
    rateLimit = true,
    validateBody = true,
    validateSize = true,
    validateContentType = true,
    maxSize = 1024 * 1024,
    allowedContentTypes = ['application/json'],
    enableCors = true,
    enableLogging = true
  } = options

  try {
    // Apply security measures
    const securityResult = await withSecurity(request, bodySchema, {
      rateLimit,
      validateBody,
      validateSize,
      validateContentType,
      maxSize,
      allowedContentTypes
    })

    if (!securityResult.success) {
      return securityResult
    }

    // Create response with security headers
    let response = NextResponse.json({ success: true })
    response = addSecurityHeaders(response)
    
    if (enableCors) {
      response = addCorsHeaders(response, request)
    }
    
    if (enableLogging) {
      logRequest(request, response)
    }

    return {
      success: true,
      data: securityResult.data,
      response
    }
  } catch (error) {
    const errorResponse = handleError(error, request)
    return { success: false, response: errorResponse }
  }
}
