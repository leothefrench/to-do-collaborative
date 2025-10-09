// app/page.tsx (Ceci est un Server Component par défaut)
import { cookies } from 'next/headers';
import HomeContent from '@/components/HomeContent'; // ⬅️ Importez le composant Client

// Fonction asynchrone pour lire l'état d'authentification côté Serveur
async function getUserStatus() {
  // Lit le cookie sécurisé HttpOnly (disponible uniquement côté serveur)
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');

  // Le statut est basé sur la présence du jeton
  return !!tokenCookie?.value;
}

// Le Server Component principal de la page
export default async function HomePage() {
  const isLoggedIn = await getUserStatus();

  // Rendu du composant Client avec l'état d'authentification déterminé par le Serveur
  return <HomeContent isLoggedIn={isLoggedIn} />;
}
