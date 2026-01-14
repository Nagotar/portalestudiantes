import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger rutas del admin
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value

    // Si no hay token, redirigir al login
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      // Verificar token y rol
      const payload = await verifyToken(token)
      
      if (!payload) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Verificar que sea admin
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      console.error('Error verificando token:', error)
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Proteger rutas de estudiante
  if (pathname.startsWith('/estudiante')) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      const payload = await verifyToken(token)
      
      if (!payload) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Verificar que sea estudiante o admin
      if (payload.role !== 'estudiante' && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      console.error('Error verificando token:', error)
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/estudiante/:path*'
  ]
}
