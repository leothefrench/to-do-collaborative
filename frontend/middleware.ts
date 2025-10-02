import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const pathname = request.nextUrl.pathname;

  // --- CONSOLE LOGS POUR LE DIAGNOSTIC ---
  console.log('Chemin Accédé:', pathname);
  console.log('Token:', token ? 'Présent' : 'Absent');
  // ----------------------------------------

  // Chemins publics : ceux de la landing page et de l'authentification
  const isAuthPath = pathname === '/sign-in' || pathname === '/sign-up';
  const isPublicPath = pathname === '/' || pathname === '/home' || isAuthPath;

  // --- CONSOLE LOG POUR LE DIAGNOSTIC ---
  console.log('Le chemin est-il public (isPublicPath):', isPublicPath);
  // ----------------------------------------

  // Règle 1: Si PAS connecté ET PAS sur un chemin public -> Redirige vers Sign-In
  // Ceci couvre /tasks, /contact, /profile, etc.
  if (!token && !isPublicPath) {
    // console.log('Action: Redirection vers Sign-In'); // Utile pour le debug
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Règle 2: Si connecté ET essaie d'aller sur Sign-In/Sign-Up -> Redirige vers la Landing Page '/'
  // On n'autorise pas un utilisateur connecté à se réinscrire/reconnecter.
  if (token && isAuthPath) {
    // console.log('Action: Redirection des pages Auth vers /'); // Utile pour le debug
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Règle 3: Continue la requête
  // Ce cas couvre :
  // 1. Connecté sur une page protégée (/tasks, /contact) -> Laisse passer.
  // 2. Connecté sur la Landing Page (pathname === '/') -> Laisse passer.
  // 3. Déconnecté sur la Landing Page (pathname === '/') -> Laisse passer.
  // console.log('Action: Laisse passer (Next)'); // Utile pour le debug
  return NextResponse.next();
}

export const config = {
  // Cette configuration est correcte et intercepte tous les chemins nécessaires
  matcher: [
    '/contact/:path*',
    // '/tasks/:path*',
    '/dashboard',
    '/profile',
    '/',
    '/sign-in',
    '/sign-up',
  ],
};
