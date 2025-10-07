import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { env, features } from '@/lib/env'

// Rate limit types for different endpoints
export type RateLimitType = 'general' | 'auth' | 'linkedin' | 'recording' | 'content' | 'subscription'

// Rate limiting middleware
export async function withRateLimit(
  request: NextRequest,
  limitType: RateLimitType = 'general'
): Promise<NextResponse | null> {
  // Skip rate limiting in development if not configured
  if (!features.rateLimiting && env.NODE_ENV === 'development') {
    console.warn('Rate limiting disabled - Redis not configured')
    return null
  }

  try {
    const { success, limit, remaining, reset } = await checkRateLimit(request, limitType)
    
    if (!success) {
      console.warn(`Rate limit exceeded for IP: ${getClientIP(request)}`)
      
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      )
    }

    // Add rate limit headers to successful responses
    return NextResponse.next({
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    })
  } catch (error) {
    console.error('Rate limiting error:', error)
    
    // In case of rate limiting service failure, allow the request but log the error
    if (env.NODE_ENV === 'production') {
      // In production, be more strict about rate limiting failures
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }
    
    // In development, allow the request to proceed
    return null
  }
}

// Helper function to get rate limit type from request path
export function getRateLimitType(request: NextRequest): RateLimitType {
  const pathname = request.nextUrl.pathname
  
  if (pathname.startsWith('/api/auth/')) {
    return 'auth'
  }
  
  if (pathname.startsWith('/api/linkedin/')) {
    return 'linkedin'
  }
  
  if (pathname.startsWith('/api/recordings/')) {
    return 'recording'
  }
  
  if (pathname.startsWith('/api/posts/') || pathname.startsWith('/api/processing/')) {
    return 'content'
  }
  
  if (pathname.startsWith('/api/subscription/')) {
    return 'subscription'
  }
  
  return 'general'
}

// Rate limiting decorator for API routes
export function rateLimit(limitType?: RateLimitType) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (request: NextRequest, ...args: any[]) {
      const rateLimitResponse = await withRateLimit(request, limitType)
      
      if (rateLimitResponse) {
        return rateLimitResponse
      }
      
      return originalMethod.apply(this, [request, ...args])
    }
    
    return descriptor
  }
}
