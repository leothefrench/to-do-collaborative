'use client';

import { useQueries, useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '@/context/AuthContext';
import { getTaskLists, deleteTask } from '@/actions/taskActions'; // getUserTasks est déjà supprimé
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
  const { user, loading } = useAuthContext(); // ❌ SUPPRESSION : La lecture du token dans localStorage n'est plus nécessaire ni sécurisée. // const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [
    { data: tasks = [], isLoading: tasksLoading, isError: tasksError },
    { data: taskLists = [], isLoading: listsLoading, isError: listsError },
  ] = useQueries({
    queries: [
      {
        queryKey: ['tasks', user?.id],
        queryFn: async () => {
          const API_URL =
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'; // REQUÊTE TÂCHES (GET) : Utilise le cookie (Client-side)

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
        queryKey: ['taskLists', user?.id], // MODIFICATION : Utiliser user?.id comme clé
        queryFn: () => {
          // ✅ getTaskLists ne prend plus le token en argument
          return getTaskLists();
        }, // MODIFICATION : Activation uniquement si l'utilisateur est présent
        enabled: !!user,
      },
    ],
  }); // MODIFICATION : L'argument token a été retiré

  const handleDeleteTask = async (taskId: string) => {
    // ❌ La vérification du token du localStorage est retirée.
    // ✅ Appel de la Server Action sans le token
    await deleteTask(taskId);
    queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
  };

  if (loading || tasksLoading || listsLoading) {
    return <p>Chargement des données...</p>;
  }

  if (tasksError || listsError) {
    return (
      <p>Erreur lors du chargement des données. Veuillez vous reconnecter.</p>
    );
  }

  if (!user) {
    return <p>Veuillez vous connecter pour voir vos tâches.</p>;
  } // ❌ Bloc de vérification du token du localStorage retiré ou simplifié

  return (
    <>
           {' '}
      <div className="flex justify-end gap-2 mb-4">
               {' '}
        <Sheet>
                   {' '}
          <SheetTrigger asChild>
                       {' '}
            <Button
              variant="outline"
              aria-label="Créer une nouvelle liste de tâches"
            >
                            <ListTodo className="h-4 w-4 mr-2" />             
              Nouvelle liste            {' '}
            </Button>
                     {' '}
          </SheetTrigger>
                   {' '}
          <SheetContent side="right" className="sm:max-w-md">
                       {' '}
            <SheetHeader>
                            <SheetTitle>Nouvelle liste</SheetTitle>           {' '}
            </SheetHeader>
                        {/* MODIFICATION : Ne pas passer le token */}
                        <NewTaskListForm />         {' '}
          </SheetContent>
                 {' '}
        </Sheet>
               {' '}
        <Sheet>
                   {' '}
          <SheetTrigger asChild>
                       {' '}
            <Button aria-label="Créer une nouvelle tâche">
                            <Plus className="h-4 w-4 mr-2" />             
              Nouvelle tâche            {' '}
            </Button>
                     {' '}
          </SheetTrigger>
                   {' '}
          <SheetContent side="right" className="sm:max-w-md">
                        {/* MODIFICATION : Ne pas passer le token */}
                        <NewTaskForm taskLists={taskLists} />         {' '}
          </SheetContent>
                 {' '}
        </Sheet>
             {' '}
      </div>
           {' '}
      {tasks.length === 0 ? (
        <p>Aucune tâche pour le moment.</p>
      ) : (
        <ul className="space-y-3">
                   {' '}
          {tasks.map((task: any) => (
            <li
              key={task.id}
              className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition flex items-center justify-between"
            >
                           {' '}
              <div>
                                <h3 className="font-semibold">{task.title}</h3> 
                             {' '}
                <p className="text-sm text-muted-foreground">
                                    Deadline :                  {' '}
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : 'Non définie'}
                                 {' '}
                </p>
                             {' '}
              </div>
                           {' '}
              <AlertDialog>
                               {' '}
                <AlertDialogTrigger asChild>
                                   {' '}
                  <Button
                    variant="destructive"
                    size="icon"
                    aria-label="Supprimer la tâche"
                  >
                                        <Trash2 className="h-4 w-4" />         
                           {' '}
                  </Button>
                                 {' '}
                </AlertDialogTrigger>
                               {' '}
                <AlertDialogContent>
                                   {' '}
                  <AlertDialogHeader>
                                       {' '}
                    <AlertDialogTitle>
                                            Confirmez-vous la suppression ?    
                                     {' '}
                    </AlertDialogTitle>
                                       {' '}
                    <AlertDialogDescription>
                                            Cette action est irréversible. La
                      suppression de la tâche                       sera
                      définitive.                    {' '}
                    </AlertDialogDescription>
                                     {' '}
                  </AlertDialogHeader>
                                   {' '}
                  <AlertDialogFooter>
                                       {' '}
                    <AlertDialogCancel>Annuler</AlertDialogCancel>             
                         {' '}
                    <AlertDialogAction
                      onClick={() => handleDeleteTask(task.id)}
                    >
                                            Confirmer                    {' '}
                    </AlertDialogAction>
                                     {' '}
                  </AlertDialogFooter>
                                 {' '}
                </AlertDialogContent>
                             {' '}
              </AlertDialog>
                         {' '}
            </li>
          ))}
                 {' '}
        </ul>
      )}
         {' '}
    </>
  );
}
