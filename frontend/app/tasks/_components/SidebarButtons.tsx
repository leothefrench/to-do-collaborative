'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ListTodo, Plus, Users } from 'lucide-react';

// Assurez-vous d'importer ces formulaires depuis leur emplacement réel
import NewTaskListForm from './NewTaskListForm';
import NewTaskForm from './NewTaskForm';
import ShareListForm from './ShareListForm';

interface AuthUser {
  plan: 'FREE' | 'PREMIUM';
  premiumTrialActivatedAt: string | null | Date;
}

const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;

// Note : taskLists est passé en prop, récupéré côté serveur
export default function SidebarButtons({
  taskLists,
  user,
}: {
  taskLists: any[];
  user: AuthUser;
}) {
  // État pour les deux dialogues (nécessaire pour la fermeture automatique)
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

  const hasAccessToSharing = isPremium || isTrialActive || (user.plan === 'FREE' && !isTrialActivated)

  return (
    <div className="flex flex-col gap-3 mt-6 p-2">
      {/* Bouton Nouvelle Tâche */}
      <Sheet open={isNewTaskSheetOpen} onOpenChange={setIsNewTaskSheetOpen}>
        <SheetTrigger asChild>
          <Button aria-label="Créer une nouvelle tâche" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle tâche
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Créer une nouvelle tâche</SheetTitle>
          </SheetHeader>
          {/* Les props onClose sont gérées par la fonction passée ici */}
          <NewTaskForm
            taskLists={taskLists}
            onClose={() => setIsNewTaskSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Bouton Nouvelle Liste */}
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
            <Users className="h-4 w-4 mr-2" />
            Partager une liste
            {!hasAccessToSharing && (
              <span className="absolute right-2 text-xs bg-yellow-400 text-black px-1 rounded font-semibold">
                Pro
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Partager une liste</SheetTitle>
          </SheetHeader>
          {/* Formulaire d'invitation (à créer à la prochaine étape) */}
          {/* Nous allons l'appeler ShareListForm */}
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
