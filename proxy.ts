import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from './src/services/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function proxy(req: NextRequest) {
  // 1. Mettre à jour les cookies Supabase et récupérer l'utilisateur
  const { response, user } = await updateSession(req)
  const hasSession = !!user

  const pathname = req.nextUrl.pathname
  const url = req.nextUrl.clone()

  const publicRoutes = ['/auth/login', '/auth/signup']
  const protectedRoutes = ['/home', '/albums', '/events', '/contact', '/support']
  const adminRoutes = ['/admin']

  console.log(`[Middleware] 🔍 ${pathname} | session: ${hasSession}`)

  // 2. Vérifier le rôle admin si nécessaire
  let isAdmin = false
  if (hasSession && adminRoutes.some(route => pathname.startsWith(route))) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
        },
      }
    )

    // Récupérer le profil utilisateur pour vérifier le rôle
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    isAdmin = profile?.role === 'admin'
  }

  // 3. Redirections
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    if (hasSession) {
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }
    return response
  }

  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!hasSession) {
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
    return response
  }

  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!hasSession || !isAdmin) {
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
    return response
  }

  if (pathname === '/') {
    if (hasSession) {
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return response
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
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
