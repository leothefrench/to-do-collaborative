// Fichier : lib/auth.ts (Version corrigée)

import { jwtVerify, JWTPayload } from 'jose';
import { redirect } from 'next/navigation';

// ❌ SUPPRESSION: Retrait de l'import KeyLike qui pose problème
// import { KeyLike } from 'jose';

// ⚠️ Le SECRET DOIT ÊTRE EXACTEMENT LE MÊME que celui de votre backend Fastify
const JWT_SECRET = process.env.JWT_SECRET;

// Interface pour les données de l'utilisateur (le payload du JWT)
// ⚠️ Adaptez 'id' si votre Fastify utilise 'userId'
interface UserPayload extends JWTPayload {
  id: string;
  email: string;
}

export async function verifyAuth(
  token: string | undefined | null
): Promise<{ isLoggedIn: boolean; user: UserPayload | null }> {
  if (!token) {
    return { isLoggedIn: false, user: null };
  }

  // Vérification de la variable d'environnement (Sécurité)
  if (!JWT_SECRET) {
    console.error(
      "ERREUR CRITIQUE: JWT_SECRET non défini dans les variables d'environnement de Next.js."
    );
    return { isLoggedIn: false, user: null };
  }

  try {
    // Le secret doit être encodé en Uint8Array pour la librairie 'jose'
    // Nous utilisons directement le type natif Uint8Array pour contourner l'erreur KeyLike
    const secretKey: Uint8Array = new TextEncoder().encode(JWT_SECRET);

    // Vérification du token (signature et expiration)
    const verified = await jwtVerify(token, secretKey);

    // Récupération des données utilisateur
    const user = verified.payload as UserPayload;

    return {
      isLoggedIn: true,
      user,
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return {
      isLoggedIn: false,
      user: null,
    };
  }
}

/**
 * Fonction utilitaire pour récupérer l'utilisateur dans les Server Components
 * et gérer la redirection automatique vers la connexion si non authentifié.
 */
export async function getAuthUser() {
  // On utilise les imports Server Component pour lire le cookie
  const { cookies } = await import('next/headers');
  const cookiesStore = await cookies();
  const token = cookiesStore.get('token')?.value;

  const { isLoggedIn, user } = await verifyAuth(token);

  if (!isLoggedIn || !user) {
    redirect('/sign-in');
  }

  return user;
}
