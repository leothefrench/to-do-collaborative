'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LayoutDashboard, ListTodo, Star, Menu } from 'lucide-react';
import AllTasks from './_components/AllTasks';

export default function TasksPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const NavLinks = () => (
    <nav aria-label="Navigation principale">
      <ul className="space-y-4">
        <li>
          <Link
            href="/tasks"
            className="flex items-center gap-2 hover:underline"
          >
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

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-64 flex-col border-r p-4 bg-background">
        <h2 className="text-xl font-semibold mb-6">Mes projets</h2>
        <NavLinks />
      </aside>

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

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Tableau de tâches</h1>
        <AllTasks />
      </main>
    </div>
  );
}
