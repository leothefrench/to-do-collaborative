'use client';

import { useQueries } from '@tanstack/react-query';

import { useAuthContext } from '@/context/AuthContext';
import { getUserTasks, getTaskLists } from '@/actions/taskActions';
import NewTaskForm from './NewTaskForm';
import NewTaskListForm from './NewTaskListForm';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Plus, ListTodo } from 'lucide-react';

export default function AllTasks() {
  const { user, loading } = useAuthContext();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

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
              className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition"
            >
              <h3 className="font-semibold">{task.title}</h3>
              <p className="text-sm text-muted-foreground">
                Deadline :{' '}
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : 'Non définie'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
