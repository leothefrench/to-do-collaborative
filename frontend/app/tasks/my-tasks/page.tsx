'use client';

import AllTasks from '../_components/AllTasks';

export default function MyTasksPage() {
  return (
    <main className="flex-1 p-6">
      <h1 className="text-2xl font-bold mb-4">Mes tâches</h1>
      <AllTasks />
    </main>
  );
}
