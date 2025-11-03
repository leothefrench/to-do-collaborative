'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ListTodo, Plus, Users, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskList } from '@/app/types';
import { UserPayload } from '@/lib/auth';
import NewTaskListForm from './NewTaskListForm';
import NewTaskForm from './NewTaskForm';
import ShareListForm from './ShareListForm';

const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;

export default function SidebarButtons({
  taskLists,
  user,
}: {
  taskLists: TaskList[];
  user: UserPayload;
}) {

  const [isNewTaskSheetOpen, setIsNewTaskSheetOpen] = useState(false);
  const [isNewListSheetOpen, setIsNewListSheetOpen] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);

  const isPremium = user.plan && String(user.plan).toUpperCase() === 'PREMIUM';

  const isTrialActivated = !!user.premiumTrialActivatedAt;

  const isTrialActive = user.premiumTrialActivatedAt
    ? Date.now() -
        new Date(user.premiumTrialActivatedAt as string | Date).getTime() <
      ONE_MONTH_IN_MS
    : false;

  const hasAccessToSharing =
    isPremium || isTrialActive || (user.plan === 'FREE' && !isTrialActivated);
    
  const isCurrentUserOwner = (list: TaskList) => list.ownerId === user.id;

  return (
    <div className="flex flex-col gap-3 mt-6 p-2">
      <div className="flex flex-col gap-1 border-t pt-4">
        <h3 className="text-sm font-semibold mb-2 text-gray-500 uppercase tracking-wider">
          Mes Listes
        </h3>

        {taskLists.map((list) => {
          const isShared = list.sharedWith && list.sharedWith.length > 0;
          return (
            <Link
              key={list.id}
              href={`/tasks/list/${list.id}`}
              className={cn(
               'flex items-center justify-between p-2 rounded-lg transition-colors',
                'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <div className="flex items-center truncate">
                <ListTodo className="h-4 w-4 mr-2 flex-shrink-0 text-gray-600" />

                <span className="truncate text-sm font-medium">
                  {list.name}
                </span>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                {isShared && (
                  <span
                    title={`Partagée avec ${list.sharedWith?.length ?? 0} personne(s)`}
                  >
                    <Users className="h-4 w-4 text-blue-500" />
                  </span>
                )}

                {!isCurrentUserOwner(list) && (
                  <span
                    className="text-xs text-gray-500"
                    title={`Propriétaire: ${list.owner.userName}`}
                  >
                    Collab
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </Link>
          );
        })}
      </div>
      <Sheet open={isNewTaskSheetOpen} onOpenChange={setIsNewTaskSheetOpen}>
        <SheetTrigger asChild>
          <Button aria-label="Créer une nouvelle tâche" className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Nouvelle tâche
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Créer une nouvelle tâche</SheetTitle>
          </SheetHeader>

          <NewTaskForm
            taskLists={taskLists}
            onClose={() => setIsNewTaskSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
      <Sheet open={isNewListSheetOpen} onOpenChange={setIsNewListSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            aria-label="Créer une nouvelle liste de tâches"
            className="w-full"
          >
            <ListTodo className="h-4 w-4 mr-2" />
            Nouvelle liste
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Nouvelle liste</SheetTitle>
          </SheetHeader>

          <NewTaskListForm onClose={() => setIsNewListSheetOpen(false)} />
        </SheetContent>
      </Sheet>
      <Sheet open={isShareSheetOpen} onOpenChange={setIsShareSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant={hasAccessToSharing ? 'default' : 'secondary'}
            aria-label="Partager une liste de tâches (Premium)"
            className="w-full justify-start relative"
            disabled={!hasAccessToSharing} // Désactivé si l'accès n'est pas là
          >
            <Users className="h-4 w-4 mr-2" /> Partager une liste
            {!hasAccessToSharing && (
              <span className="absolute right-2 text-xs bg-yellow-400 text-black px-1 rounded font-semibold"></span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Partager une liste</SheetTitle>
          </SheetHeader>
          <ShareListForm
            taskLists={taskLists}
            onClose={() => setIsShareSheetOpen(false)}
            user={user}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
