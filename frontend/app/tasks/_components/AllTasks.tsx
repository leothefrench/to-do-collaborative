'use client';

import { useQueries, useQueryClient } from '@tanstack/react-query';
import { getTaskLists, deleteTask } from '@/actions/taskActions';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

export default function AllTasks({ user }: { user: { id: string } | null }) {
  const queryClient = useQueryClient();

  const [
    { data: tasks = [], isLoading: tasksLoading, isError: tasksError },
    { data: taskLists = [], isLoading: listsLoading, isError: listsError },
  ] = useQueries({
    queries: [
      {
        queryKey: ['tasks', user?.id],
        queryFn: async () => {
          const API_URL =
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

          const res = await fetch(`${API_URL}/tasks`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            cache: 'no-store',
          });

          if (!res.ok) {
            return [];
          }
          return res.json();
        },
        enabled: !!user,
      },
      {
        queryKey: ['taskLists', user?.id],
        queryFn: () => {
          return getTaskLists();
        },
        enabled: !!user,
      },
    ],
  });

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
  };

  if (tasksLoading || listsLoading) {
    return <p>Chargement des données...</p>;
  }

  if (tasksError || listsError) {
    return (
      <p>Erreur lors du chargement des données. Veuillez vous reconnecter.</p>
    );
  }

  if (!user) {
    return <p>Veuillez vous connecter pour voir vos tâches.</p>;
  }

  return (
    <>
      {/* L'ancienne div des boutons a été supprimée */}

      {tasks.length === 0 ? (
        <p>Aucune tâche pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task: any) => (
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
                      Cette action est irréversible. La suppression de la tâche
                      sera définitive.
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
    </>
  );
}
