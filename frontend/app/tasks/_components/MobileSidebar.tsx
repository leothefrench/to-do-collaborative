// Fichier : app/tasks/_components/MobileSidebar.tsx

'use client'; // ⬅️ C'est un Client Component pour utiliser l'état

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LayoutDashboard, Star, Menu } from 'lucide-react';

// Composant de liens (pour la Sidebar et le menu Mobile)
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

export default function MobileSidebar() {
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
          <h2 className="text-xl font-semibold mb-6">Mes projets</h2>
          <NavLinks />
        </SheetContent>
      </Sheet>
    </div>
  );
}
