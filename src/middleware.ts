import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { env } from './env'

export function middleware(request: NextRequest) {
  // Create a new response
  const response = NextResponse.next()
  
  // Only add headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Get API key from env
    const apiKey = env.ANTHROPIC_API_KEY
    
    if (!apiKey) {
      console.error('API Key not found in environment')
    } else {
      response.headers.set('x-env-anthropic-key', apiKey)
    }
  }
  
  return response
}

export const config = {
  matcher: '/api/:path*',
} 