// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // On laisse tout passer.
  // L'auth est gérée côté client (AuthGuard + RoleGuard), c'est plus fiable avec ton système actuel.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};