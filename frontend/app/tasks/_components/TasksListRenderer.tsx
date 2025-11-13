// frontend/app/tasks/_components/TasksListRenderer.tsx
'use client';

import { Task } from '@/app/types';
import { useQueryClient } from '@tanstack/react-query';
import { deleteTask, toggleTaskFavorite } from '@/actions/taskActions';
import { Trash2, Star } from 'lucide-react';
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

interface TasksListRendererProps {
  tasks: Task[];
}

export default function TasksListRenderer({ tasks }: TasksListRendererProps) {
  const queryClient = useQueryClient();

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  const handleToggleFavorite = async (task: Task) => {
    await toggleTaskFavorite(task.id, task.isFavorite);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <p>Aucune tâche pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task: Task) => (
            <li
              key={task.id}
              className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition flex items-center justify-between"
              role="listitem"
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

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleFavorite(task)}
                  aria-label={
                    task.isFavorite
                      ? 'Retirer des favoris'
                      : 'Ajouter aux favoris'
                  }
                  title={
                    task.isFavorite
                      ? 'Retirer des favoris'
                      : 'Ajouter aux favoris'
                  }
                >
                  {task.isFavorite ? (
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <Star className="h-5 w-5 text-gray-400" />
                  )}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      aria-label={`Supprimer la tâche ${task.title}`}
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
