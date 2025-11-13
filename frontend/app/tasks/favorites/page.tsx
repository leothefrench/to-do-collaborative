import { getAuthUser, UserPayload } from '@/lib/auth';
import { getTaskLists, getTasksByFavorite } from '@/actions/taskActions';
import { TaskList, Task } from '@/app/types';
import TasksView from '../_components/TasksView';

export default async function FavoritesPage() {
  const user: UserPayload = await getAuthUser();

  const allTaskLists: TaskList[] = await getTaskLists();
  const favoriteTasks: Task[] = await getTasksByFavorite();

  return (
    <TasksView
      title="Tâches favorites"
      tasks={favoriteTasks}
      allTaskLists={allTaskLists}
      user={user}
    />
  );
}
