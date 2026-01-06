import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Next.js 16+ renamed "middleware" to "proxy" - this runs at the edge before requests reach the app.
// Used here for Supabase auth session refresh and route protection.
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Define public routes that don't require auth
  const publicRoutes = ['/login', '/signup']
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If user is not logged in and trying to access protected route
    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // If user is logged in and trying to access login/signup
    // Redirect to AI recommendations - the main feature we want users to experience!
    if (user && isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/recommendations'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error) {
    // If Supabase is unreachable (network error, project paused, etc.),
    // allow access to public routes, redirect others to login
    console.error('Proxy: Supabase connection failed:', error)
    
    if (isPublicRoute) {
      return supabaseResponse
    }
    
    // Can't verify auth - redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
