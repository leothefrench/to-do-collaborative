
'use client';

import { TaskList, Task } from '@/app/types'; // Import des types que nous avons créés
import { UserPayload } from '@/lib/auth'; // Import du type UserPayload
import { ScrollArea } from '@/components/ui/scroll-area';
import MobileSidebar from './MobileSidebar'; // Votre composant de Sidebar
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'; // Pour la suppression

// Importations nécessaires pour le rendu de la tâche
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query'; // Si vous utilisez React Query ici
import { deleteTask } from '@/actions/taskActions';

interface TaskListDetailProps {
  currentList: TaskList;
  tasks: Task[];
  allTaskLists: TaskList[];
  user: UserPayload;
}

export default function TaskListDetail({
  currentList,
  tasks,
  allTaskLists,
  user,
}: TaskListDetailProps) {
  const queryClient = useQueryClient(); // Pour invalider le cache après suppression

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    // Invalider le cache pour rafraîchir la liste affichée
    queryClient.invalidateQueries({ queryKey: ['tasks', currentList.id] });
  };

  if (!user) return null;

  return (
    <div className="flex h-full">
      {/* Sidebar - Nous laissons la gestion de l'affichage dans MobileSidebar */}
      <MobileSidebar taskLists={allTaskLists} user={user} />

      {/* Zone principale des tâches */}
      <ScrollArea className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">{currentList.name}</h1>

        {currentList.description && (
          <p className="text-gray-500 mb-6">{currentList.description}</p>
        )}

        {/* --- DÉBUT AFFICHAGE COLLABORATEURS (CORRIGÉ) --- */}
        {currentList.sharedWithUsers &&
          currentList.sharedWithUsers.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-sm font-semibold text-gray-700">
                Partagé avec :
              </span>
              {currentList.sharedWithUsers.map((share) => (
                // La structure d'accès est bien share.user.userName
                <div
                  key={share.user.id}
                  className="flex items-center space-x-1 p-1 px-2 text-sm rounded-full bg-blue-100 text-blue-800"
                >
                  {/* Affiche uniquement le prénom pour un affichage compact */}
                  <span className="font-medium truncate">
                    {share.user.userName.split(' ')[0]}
                  </span>
                  <span className="text-xs opacity-70">
                    ({share.permissionLevel})
                  </span>
                </div>
              ))}
            </div>
          )}
        {/* --- FIN AFFICHAGE COLLABORATEURS --- */}

        <div className="space-y-4">
          {tasks.length === 0 ? (
            <p>Aucune tâche dans cette liste. Ajoutez-en une !</p>
          ) : (
            <ul className="space-y-3">
              {/* RENDU DE CHAQUE TACHE (Adapté de votre AllTasks.tsx) */}
              {tasks.map((task: Task) => (
                <li
                  key={task.id}
                  className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Deadline :
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : 'Non définie'}
                    </p>
                  </div>

                  {/* Bouton de suppression */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        aria-label="Supprimer la tâche"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Confirmez-vous la suppression ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. La suppression de la
                          tâche sera définitive.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          Confirmer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
