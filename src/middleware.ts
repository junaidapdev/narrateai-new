import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Apply Supabase session update for all other routes
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - IMPORTANT: This excludes webhooks and checkout
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|MP4|mov|MOV)$).*)',
  ],
}