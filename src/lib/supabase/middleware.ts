import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Get environment variables with fallbacks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If environment variables are missing, just pass through without auth checks
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not configured in middleware')
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // This will refresh session if expired - required for Server Components
  let user = null
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  } catch (error) {
    console.warn('Failed to get user in middleware:', error)
    // Continue without auth state
  }

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Protected routes - require authentication
  const protectedRoutes = [
    '/dashboard',
    '/transactions',
    '/budgets',
    '/goals',
    '/reports',
    '/settings',
  ]
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Auth routes - redirect if already authenticated
  const authRoutes = ['/login', '/register', '/forgot-password']
  const isAuthRoute = authRoutes.includes(pathname)

  if (isProtectedRoute && !user) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Redirect root to appropriate page
  if (pathname === '/') {
    if (user) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    } else {
      // Redirect unauthenticated users directly to login
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
