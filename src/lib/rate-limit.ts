import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Rate limit configurations for different endpoints
export const rateLimits = {
  // General API endpoints - 100 requests per minute
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  }),
  
  // Authentication endpoints - 5 requests per minute
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
  }),
  
  // LinkedIn posting - 10 requests per hour
  linkedin: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
  }),
  
  // Recording upload - 20 requests per hour
  recording: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
    analytics: true,
  }),
  
  // Content generation - 50 requests per hour
  content: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 h'),
    analytics: true,
  }),
  
  // Subscription endpoints - 10 requests per minute
  subscription: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
  }),
}

// Helper function to get client IP
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return '127.0.0.1'
}

// Rate limit middleware
export async function checkRateLimit(
  request: Request,
  limitType: keyof typeof rateLimits
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const ip = getClientIP(request)
  const { success, limit, remaining, reset } = await rateLimits[limitType].limit(ip)
  
  return { success, limit, remaining, reset }
}
