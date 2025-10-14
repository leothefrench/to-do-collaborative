// Fichier : app/tasks/_components/SidebarButtons.tsx

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
import { ListTodo, Plus } from 'lucide-react';

// Assurez-vous d'importer ces formulaires depuis leur emplacement réel
import NewTaskListForm from './NewTaskListForm';
import NewTaskForm from './NewTaskForm';

// Note : taskLists est passé en prop, récupéré côté serveur
export default function SidebarButtons({ taskLists }: { taskLists: any[] }) {
  // État pour les deux dialogues (nécessaire pour la fermeture automatique)
  const [isNewTaskSheetOpen, setIsNewTaskSheetOpen] = useState(false);
  const [isNewListSheetOpen, setIsNewListSheetOpen] = useState(false);

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
    </div>
  );
}
