// MobileSidebar.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LayoutDashboard, Star, Menu, ListCollapse } from 'lucide-react';

// Importation des types : TaskList de app/types, UserPayload de lib/auth
import { TaskList } from '@/app/types'; // Assurez-vous que ce chemin est correct
import { UserPayload } from '@/lib/auth'; // Assurez-vous que ce chemin est correct

// --- INTERFACE DE PROPS ---
interface MobileSidebarProps {
  taskLists: TaskList[];
  user: UserPayload;
}
// --- FIN INTERFACE DE PROPS ---

// Composant de liens (NavLinks)
const NavLinks = ({ taskLists }: { taskLists: TaskList[] }) => (
  <nav aria-label="Navigation principale">
    <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2 mt-4">
      Général
    </h3>
    <ul className="space-y-1 mb-6">
      <li>
        <Link
          href="/tasks"
          className="flex items-center gap-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition"
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Link>
      </li>
      <li>
        <Link
          href="/tasks/favorites"
          className="flex items-center gap-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition"
        >
          <Star className="h-5 w-5" />
          Favoris
        </Link>
      </li>
    </ul>

    {/* --- LISTES DE TÂCHES DYNAMIQUES --- */}
    <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">
      Mes Listes
    </h3>
    <ul className="space-y-1">
      {taskLists.length > 0 ? (
        taskLists.map((list) => (
          <li key={list.id}>
            {/* Lien vers la vue de la liste spécifique */}
            <Link
              href={`/tasks/list/${list.id}`}
              className="flex items-center gap-2 p-2 rounded-md transition text-foreground hover:bg-accent hover:text-black"
            >
              <ListCollapse className="h-4 w-4 shrink-0" />
              <span className="truncate">{list.name}</span>
            </Link>
          </li>
        ))
      ) : (
        <p className="text-xs text-muted-foreground p-2">
          Aucune liste trouvée.
        </p>
      )}
    </ul>
    {/* --- FIN LISTES DYNAMIQUES --- */}
  </nav>
);

// Composant MobileSidebar principal
export default function MobileSidebar({ taskLists, user }: MobileSidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="md:hidden p-2">
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Ouvrir le menu">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <h2 className="text-xl font-semibold mb-1">
            Bonjour, {user.userName.split(' ')[0]}
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            Compte : {user.plan}
          </p>

          <NavLinks taskLists={taskLists} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
