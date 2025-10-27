import { jwtVerify, JWTPayload } from 'jose';
import { redirect } from 'next/navigation';

const JWT_SECRET = process.env.JWT_SECRET;

// ➡️ MODIFICATION: Mise à jour de l'interface pour inclure tous les champs de Fastify.
export interface UserPayload extends JWTPayload {
  id: string;
  userName: string;
  email: string;
  plan: 'FREE' | 'PREMIUM';
  premiumTrialActivatedAt: string | null | Date;
}

export async function verifyAuth(
  token: string | undefined | null
): Promise<{ isLoggedIn: boolean; user: UserPayload | null }> {
  if (!token) {
    return { isLoggedIn: false, user: null };
  }

  if (!JWT_SECRET) {
    console.error(
      "ERREUR CRITIQUE: JWT_SECRET non défini dans les variables d'environnement de Next.js."
    );
    return { isLoggedIn: false, user: null };
  }

  try {
    const secretKey: Uint8Array = new TextEncoder().encode(JWT_SECRET);
    const verified = await jwtVerify(token, secretKey);
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

export async function getAuthUser(): Promise<UserPayload> {
  const { cookies } = await import('next/headers');
  const cookiesStore = await cookies();
  const token = cookiesStore.get('token')?.value;

  if (!token) {
    redirect('/sign-in');
  } // 🛑 Suppression de l'appel inutile à verifyAuth(token). L'authentification // est déléguée à l'appel 'fetch' vers Fastify.
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    );
    if (!response.ok) {
      redirect('/sign-in');
    }

    const user = await response.json();
    return user as UserPayload;
  } catch (error) {
    console.error(
      'Échec de la récupération des données utilisateur complètes:',
      error
    );
    redirect('/sign-in');
  }
}

export async function getAuthToken(): Promise<string> {
  const { cookies } = await import('next/headers');
  const cookiesStore = await cookies();
  const token = cookiesStore.get('token')?.value;

  if (!token) {
    redirect('/sign-in');
  }

  return token;
}
