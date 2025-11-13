// frontend/app/tasks/_components/TaskSidebar.tsx
'use client';

import Link from 'next/link';
import { ListChecks, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskList } from '@/app/types';
import { UserPayload } from '@/lib/auth';
import SidebarButtons from './SidebarButtons'; // Assurez-vous que ce chemin est correct

interface TaskSidebarProps {
  allTaskLists: TaskList[];
  user: UserPayload;
}

const baseLinks = [
  {
    href: '/tasks',
    label: 'Toutes les tâches',
    icon: ListChecks,
  },
  {
    href: '/tasks/favorites',
    label: 'Tâches favorites',
    icon: Star,
  },
];

export default function TaskSidebar({ allTaskLists, user }: TaskSidebarProps) {
  return (
    <aside
      className="hidden md:flex w-64 flex-col border-r p-4 bg-background flex-shrink-0"
      aria-label="Navigation des tâches"
    >
      <h2 className="text-xl font-semibold mb-3">Vues</h2>

      {/* 1. Liens fixes (Toutes les tâches / Favoris) */}
      <nav className="flex flex-col gap-1 pb-4">
        {baseLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center p-2 rounded-lg transition-colors',
              'hover:bg-accent hover:text-accent-foreground'
            )}
            role="menuitem"
          >
            <link.icon className="h-4 w-4 mr-2 flex-shrink-0 text-gray-600" />
            <span className="truncate text-sm font-medium">{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* 2. Boutons d'action et listes (votre composant existant) */}
      <SidebarButtons taskLists={allTaskLists} user={user} />
    </aside>
  );
}
