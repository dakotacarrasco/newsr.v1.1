import { NextRequest, NextResponse } from 'next/server'
import { ratelimit } from '@/app/lib/ratelimit'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security Headers
  const securityHeaders = {
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "media-src 'self' data: blob:",
      "connect-src 'self' https://api.vercel.com https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com",
      "frame-src 'self' https://www.youtube.com https://www.vimeo.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; '),

    // Security headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=(self)',
      'interest-cohort=()'
    ].join(', '),

    // HSTS (only in production)
    ...(process.env.NODE_ENV === 'production' && {
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
    }),

    // Prevent caching of sensitive pages
    ...(request.nextUrl.pathname.startsWith('/dashboard') && {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    })
  }

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    try {
      const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous'
      const { success, limit, reset, remaining } = await ratelimit.limit(ip)

      response.headers.set('X-RateLimit-Limit', limit.toString())
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString())

      if (!success) {
        return new NextResponse(
          JSON.stringify({
            error: 'Too Many Requests',
            message: 'You have exceeded the rate limit. Please try again later.'
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.round((reset - Date.now()) / 1000).toString(),
              ...Object.fromEntries(response.headers.entries())
            }
          }
        )
      }
    } catch (error) {
      console.error('Rate limiting error:', error)
      // Continue without rate limiting if there's an error
    }
  }

  // Auth protection for dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check for auth token in cookies or headers
    const token = request.cookies.get('supabase-auth-token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Bot detection and blocking
  const userAgent = request.headers.get('user-agent') || ''
  const suspiciousBots = [
    'AhrefsBot',
    'MJ12bot',
    'DotBot',
    'SemrushBot',
    'serpstatbot',
    'BLEXBot'
  ]

  if (suspiciousBots.some(bot => userAgent.includes(bot))) {
    return new NextResponse('Access Denied', { status: 403 })
  }

  // Geo-blocking (if needed)
  const country = request.geo?.country
  const blockedCountries = process.env.BLOCKED_COUNTRIES?.split(',') || []
  
  if (country && blockedCountries.includes(country)) {
    return new NextResponse('Access from your location is not permitted', { status: 403 })
  }

  // Add request ID for tracking
  response.headers.set('X-Request-ID', crypto.randomUUID())

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|manifest.json|robots.txt|sitemap.xml).*)',
  ],
} 