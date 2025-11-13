import { UserPayload } from '@/lib/auth';
import { TaskList, Task } from '@/app/types';

import TaskSidebar from './TaskSidebar';
import MobileSidebar from './MobileSidebar'; 
import TasksListRenderer from './TasksListRenderer';


interface TasksViewProps {
  title: string;
  tasks: Task[];
  allTaskLists: TaskList[];
  user: UserPayload;
}

export default function TasksView({
  title,
  tasks,
  allTaskLists,
  user,
}: TasksViewProps) {
  return (
    <div className="flex h-full min-h-screen">
      {/* 1. Sidebar pour Desktop */}
      <TaskSidebar allTaskLists={allTaskLists} user={user} />

      {/* 2. Mobile Sidebar */}
      {/* Ce composant est généralement un déclencheur de Sheet/Menu sur mobile */}
      <div className="md:hidden p-4 w-full">
        <MobileSidebar taskLists={allTaskLists} user={user} />
      </div>

      {/* 3. Zone de contenu principale (Liste des tâches) */}
      <main
        className="flex-1 p-8 overflow-y-auto"
        aria-labelledby="main-task-heading"
      >
        <h1 id="main-task-heading" className="text-3xl font-bold mb-6">
          {title}
        </h1>

        {tasks.length === 0 ? (
          <p className="text-gray-500">
            {title === 'Tâches favorites'
              ? "Vous n'avez aucune tâche favorite pour le moment."
              : 'Aucune tâche à afficher.'}
          </p>
        ) : (
          <TasksListRenderer tasks={tasks} />
        )}
      </main>
    </div>
  );
}
