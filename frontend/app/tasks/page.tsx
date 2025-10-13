// Fichier : app/tasks/page.tsx (Corrigé et simplifié)

import Link from 'next/link';
import { LayoutDashboard, Star } from 'lucide-react';
// Import des composants
import AllTasks from './_components/AllTasks';
import MobileSidebar from './_components/MobileSidebar'; // ✅ NOUVEAU : Import du composant client
import { getAuthUser } from '@/lib/auth'; // Import de la fonction de sécurité

// Rendu des liens de navigation pour la Sidebar Desktop (Server Component)
const NavLinks = () => (
  <nav aria-label="Navigation principale">
    <ul className="space-y-4">
      <li>
        <Link href="/tasks" className="flex items-center gap-2 hover:underline">
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Link>
      </li>
      <li>
        <Link
          href="/tasks/favorites"
          className="flex items-center gap-2 hover:underline"
        >
          <Star className="h-5 w-5" />
          Favoris
        </Link>
      </li>
    </ul>
  </nav>
);

// ✅ Server Component (async function)
export default async function TasksPage() {
  // 1. Vérification de l'authentification et obtention de l'utilisateur
  // Redirection automatique si non authentifié.
  const user = await getAuthUser();

  return (
    <div className="flex min-h-screen">
      {/* 2. Sidebar statique pour Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r p-4 bg-background">
        <h2 className="text-xl font-semibold mb-6">Mes projets</h2>
        <NavLinks />
      </aside>

      {/* 3. Utilisation du composant client pour le menu mobile */}
      <MobileSidebar />

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Tableau de tâches</h1>

        {/* 4. Correction de l'erreur 'user missing' */}
        <AllTasks user={user} />
      </main>
    </div>
  );
}
