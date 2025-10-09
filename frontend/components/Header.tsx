// Fichier : components/Header.tsx

import { cookies } from 'next/headers';
import { Navbar } from './Navbar'; // Importe votre Navbar Client Component

// Fonction asynchrone pour lire l'état d'authentification côté Serveur
async function getUserStatus() {
  // Lit le cookie sécurisé HttpOnly directement.
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');

  // Le statut de connexion est basé sur la présence du jeton
  return !!tokenCookie?.value;
}

// ⚠️ NOUVEAU : Ce Server Component détermine l'état et passe la prop
export default async function Header() {
  const isLoggedIn = await getUserStatus();

  return (
    // On passe l'état déterminé par le serveur à la Navbar Client
    <Navbar isLoggedIn={isLoggedIn} />
  );
}
