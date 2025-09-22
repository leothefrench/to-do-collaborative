'use client';

import { useQueries, useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '@/context/AuthContext';
import { getUserTasks, getTaskLists, deleteTask } from '@/actions/taskActions';
import NewTaskForm from './NewTaskForm';
import NewTaskListForm from './NewTaskListForm';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
import { Plus, ListTodo, Trash2 } from 'lucide-react';

export default function AllTasks() {
  const queryClient = useQueryClient();
  const { user, loading } = useAuthContext();
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [
    { data: tasks = [], isLoading: tasksLoading, isError: tasksError },
    { data: taskLists = [], isLoading: listsLoading, isError: listsError },
  ] = useQueries({
    queries: [
      {
        queryKey: ['tasks', token],
        queryFn: ({ queryKey }) => {
          const [_key, token] = queryKey;
          if (!token) return Promise.resolve([]);
          return getUserTasks(token as string);
        },
        enabled: !!token,
      },
      {
        queryKey: ['taskLists', token],
        queryFn: ({ queryKey }) => {
          const [_key, token] = queryKey;
          if (!token) return Promise.resolve([]);
          return getTaskLists(token as string);
        },
        enabled: !!token,
      },
    ],
  });

  const handleDeleteTask = async (taskId: string) => {
    if (!token) {
      console.error('Token manquant. Impossible de supprimer la tâche.');
      return;
    }

    await deleteTask(taskId, token);
    queryClient.invalidateQueries({ queryKey: ['tasks', token] });
  };

  if (loading || tasksLoading || listsLoading) {
    return <p>Chargement des données...</p>;
  }

  if (tasksError || listsError) {
    return <p>Erreur lors du chargement des données.</p>;
  }

  if (!user) {
    return <p>Veuillez vous connecter pour voir vos tâches.</p>;
  }

  if (!token) {
    return <p>Veuillez vous connecter pour créer une tâche.</p>;
  }

  return (
    <>
      <div className="flex justify-end gap-2 mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              aria-label="Créer une nouvelle liste de tâches"
            >
              <ListTodo className="h-4 w-4 mr-2" />
              Nouvelle liste
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Nouvelle liste</SheetTitle>
            </SheetHeader>
            <NewTaskListForm token={token} />
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button aria-label="Créer une nouvelle tâche">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle tâche
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-md">
            <NewTaskForm taskLists={taskLists} token={token} />
          </SheetContent>
        </Sheet>
      </div>

      {tasks.length === 0 ? (
        <p>Aucune tâche pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task: any) => (
            <li
              key={task.id}
              className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition flex items-center justify-between" // 🟢 Ajout de classes flexbox
            >
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Deadline :{' '}
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : 'Non définie'}
                </p>
              </div>

              {/* 🟢 Ajout du composant AlertDialog */}
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
