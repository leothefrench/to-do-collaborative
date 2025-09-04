'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserTasks } from '@/actions/taskActions';
import { useAuthContext } from '@/context/AuthContext';

export default function AllTasks() {
  const { user, loading } = useAuthContext();
  // ✅ On récupère user et loading (pas de token dispo directement dans le context)

  // ✅ On va lire le token depuis localStorage
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // ✅ On utilise TanStack Query
  const {
    data: tasks = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['tasks', token], // le token est mis dans la clé
    queryFn: ({ queryKey }) => {
      const [_key, token] = queryKey;
      if (!token) return Promise.resolve([]); // si pas de token, pas d’appel
      return getUserTasks(token as string); // ✅ on passe bien le token
    },
    enabled: !!token, // n’exécute pas si pas de token
  });

  if (loading || isLoading) {
    return <p>Chargement des tâches...</p>;
  }

  if (isError) {
    return <p>Erreur lors du chargement des tâches.</p>;
  }

  if (!user) {
    return <p>Veuillez vous connecter pour voir vos tâches.</p>;
  }

  if (tasks.length === 0) {
    return <p>Aucune tâche pour le moment.</p>;
  }

  return (
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
  );
}


