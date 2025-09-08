'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LayoutDashboard, ListTodo, Star, Menu, Plus } from 'lucide-react';
import NewTaskForm from '@/app/tasks/_components/NewTaskForm';

export default function TasksPage() {
  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)

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
            href="/tasks/my-tasks"
            className="flex items-center gap-2 hover:underline"
          >
            <ListTodo className="h-5 w-5" />
            Mes tâches
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
      <div className="mt-6">
        <Button
          onClick={() => setShowForm((prev) => !prev)}
          aria-expanded={showForm}
          aria-controls="new-task-form"
          className="w-full flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouvelle tâche
        </Button>
        {showForm && (
          <div id="new-task-form" className="mt-4">
            <NewTaskForm open={showForm} onClose={() => setShowForm(false)} />
          </div>
        )}
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r p-4 bg-background">
        <h2 className="text-xl font-semibold mb-6">Mes projets</h2>
        <NavLinks />
      </aside>

      {/* Sidebar mobile via Sheet */}
      <div className="md:hidden p-2">
        <Sheet open={open} onOpenChange={setOpen}>
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

      {/* Contenu principal */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Tableau de tâches</h1>
        <p className="text-muted-foreground">
          Ici s’afficheront tes colonnes et cartes comme dans Trello.
        </p>
      </main>
    </div>
  );
}
