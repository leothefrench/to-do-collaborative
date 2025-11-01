import { redirect } from 'next/navigation';
import { getAuthUser, UserPayload } from '@/lib/auth';
import { getTaskLists, getTasksByTaskListId } from '@/actions/taskActions';
import { TaskList, Task } from '../../../types';
import TaskListDetail from '../../_components/TaskListDetail';

interface TaskListPageProps {
  params: {
    listId: string;
  };
}

export default async function TaskListPage({ params }: TaskListPageProps) {
  const { listId } = await params;

  // MODIFIÉ : Utilise la fonction getAuthUser existante. Elle redirigera vers /sign-in si l'authentification échoue.
  const user: UserPayload = await getAuthUser();

  // La vérification de l'authentification est déléguée à getAuthUser (qui redirige).
  // Si nous arrivons ici, l'utilisateur est authentifié.

  // 1. Récupérer toutes les listes
  // NOTE: getTaskLists doit accepter l'ID de l'utilisateur, ce qui n'était pas dans votre code d'hier, je le suppose.
  const allTaskLists: TaskList[] = await getTaskLists();

  // 2. Récupérer les tâches spécifiques à cette liste
  const currentTasks: Task[] = await getTasksByTaskListId(listId);

  // 3. Trouver la liste courante
  const currentList = allTaskLists.find((list) => list.id === listId);

  if (!currentList) {
    // Si la liste n'existe pas ou n'appartient pas à l'utilisateur (ou n'est pas partagée avec lui)
    redirect('/tasks');
  }

  return (
    <TaskListDetail
      currentList={currentList}
      tasks={currentTasks}
      allTaskLists={allTaskLists}
      user={user}
    />
  );
}
