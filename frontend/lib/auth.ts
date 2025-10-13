import { jwtVerify, JWTPayload } from 'jose';
import { redirect } from 'next/navigation';

const JWT_SECRET = process.env.JWT_SECRET;
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

export async function getAuthUser() {
  const { cookies } = await import('next/headers');
  const cookiesStore = await cookies();
  const token = cookiesStore.get('token')?.value;

  const { isLoggedIn, user } = await verifyAuth(token);

  if (!isLoggedIn || !user) {
    redirect('/sign-in');
  }

  return user;
}
