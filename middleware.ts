import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. Prioridad: preferencia guardada del usuario
  const savedLocale = request.cookies.get('veritas_locale')?.value

  if (savedLocale) {
    // Si ya tiene cookie, inyectarla en el header (para que el server lo pueda leer en App Router sin depender de cookies si falla)
    const response = NextResponse.next()
    response.headers.set('x-veritas-locale', savedLocale)
    return response
  }

  // 2. Detección por país de IP (Vercel/Cloudflare)
  const country = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || 'CO'
  
  let detectedLocale = 'es-CO'
  if (country === 'US' || country === 'GB' || country === 'CA' || country === 'AU') {
    detectedLocale = 'en-US'
  }

  // 3. Establecer cookie inicial
  const response = NextResponse.next()
  response.cookies.set('veritas_locale', detectedLocale, {
    maxAge: 60 * 60 * 24 * 30, // 30 días
    path: '/',
    sameSite: 'lax',
  })
  response.headers.set('x-veritas-locale', detectedLocale)

  return response
}

export const config = {
  matcher: [
    // Evitar rutas estáticas y API (solo nos importa el UI y páginas, las API routes leerán la cookie directamente)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
