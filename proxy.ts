import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from './src/services/supabase/middleware'
/* c'est vrai que tout fonctionne comme prévu, 
mais pour un vrai déploiement , le site doit proposer l'option de connexion de façon facultative, c'est à dire on arrive bien sur /home, et on a avec les onglets de navigation la possibilité de créer un compte ou de se connecter */
export async function proxy(req: NextRequest) {
  // 1. Mettre à jour les cookies Supabase
  const res = await updateSession(req)

  const pathname = req.nextUrl.pathname
  const url = req.nextUrl.clone()

  const publicRoutes = ['/auth/login', '/auth/signup']
  const protectedRoutes = ['/home', '/about', '/albums', '/events', '/contact', '/support']
  const adminRoutes = ['/admin']

  // 2. Vérifier la session utilisateur via les cookies (maintenant disponibles)
  const { createServerClient } = await import('@supabase/ssr')
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

  const { data: { user } } = await supabase.auth.getUser()
  const hasSession = !!user

  console.log(`[Middleware] 🔍 ${pathname} | session: ${hasSession}`)

  // 3. Redirections
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    if (hasSession) {
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }
    return res
  }

  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!hasSession) {
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
    return res
  }

  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!hasSession) {
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
    return res
  }

  if (pathname === '/') {
    if (hasSession) {
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return res
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
