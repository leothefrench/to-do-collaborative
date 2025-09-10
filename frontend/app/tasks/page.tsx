'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LayoutDashboard, ListTodo, Star, Menu, Plus } from 'lucide-react';
import NewTaskForm from '@/app/tasks/_components/NewTaskForm';
import NewTaskListForm from '@/app/tasks/_components/NewTaskListForm';

export default function TasksPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNewTaskSheetOpen, setIsNewTaskSheetOpen] = useState(false);
  const [isNewTaskListSheetOpen, setIsNewTaskListSheetOpen] = useState(false);

  // Données mockées des listes de tâches, similaires à votre modèle Prisma.
  // Plus tard, ces données seront récupérées depuis votre base de données.
  const taskLists = [
    {
      id: 'taskList-1',
      name: 'Travail',
      description: 'Tâches professionnelles',
    },
    { id: 'taskList-2', name: 'Personnel', description: 'Tâches du quotidien' },
    {
      id: 'taskList-3',
      name: 'Projets',
      description: 'Tâches pour des projets spécifiques',
    },
  ];

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
      <div className="mt-6 space-y-2">
        <Sheet open={isNewTaskSheetOpen} onOpenChange={setIsNewTaskSheetOpen}>
          <SheetTrigger asChild>
            <Button
              aria-label="Créer une nouvelle tâche"
              className="w-full flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvelle tâche
            </Button>
          </SheetTrigger>
          <NewTaskForm taskLists={taskLists} />
        </Sheet>
        {/* J'ajoute le même schéma pour la création d'une nouvelle liste. */}
        <Sheet
          open={isNewTaskListSheetOpen}
          onOpenChange={setIsNewTaskListSheetOpen}
        >
          <SheetTrigger asChild>
            <Button
              variant="outline"
              aria-label="Créer une nouvelle liste de tâches"
              className="w-full flex items-center gap-2"
            >
              <ListTodo className="h-4 w-4" />
              Nouvelle liste
            </Button>
          </SheetTrigger>
          <NewTaskListForm />
        </Sheet>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop inchangée */}
      <aside className="hidden md:flex w-64 flex-col border-r p-4 bg-background">
        <h2 className="text-xl font-semibold mb-6">Mes projets</h2>
        <NavLinks />
      </aside>

      {/* Sidebar mobile via Sheet inchangée */}
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

      {/* Contenu principal inchangé */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Tableau de tâches</h1>
        <p className="text-muted-foreground">
          Ici s’afficheront tes colonnes et cartes comme dans Trello.
        </p>
      </main>
    </div>
  );
}
