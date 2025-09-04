'use client';

import { useQuery } from '@tanstack/react-query';

async function fetchTasks() {
    
  const res = await fetch('http://localhost:3001/tasks', {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Erreur lors du chargement des tâches');
  return res.json();
}

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });
}
