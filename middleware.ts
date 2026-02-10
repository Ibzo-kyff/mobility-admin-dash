// middleware.ts - Version corrigée
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Routes protégées - AJOUTER '/reserve' ici
  const protectedRoutes = ['/dashboard', '/profile', '/reservations', '/reserve'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Routes d'authentification
  const authRoutes = ['/auth', '/login', '/register'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Si l'utilisateur n'est pas connecté et tente d'accéder à une route protégée
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth?tab=login', request.url));
  }

  // Si l'utilisateur est connecté et tente d'accéder à une route d'authentification
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};