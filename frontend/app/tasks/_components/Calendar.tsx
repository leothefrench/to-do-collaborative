'use client';

import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useQueries } from '@tanstack/react-query';
import { getUserTasks } from '@/actions/taskActions';
import { useAuthContext } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';

export default function CalendarComponent() {
  const { user, loading } = useAuthContext();
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [{ data: tasks = [] }] = useQueries({
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
    ],
  });

  const onChange = (date: Date) => {
    setSelectedDate(date);
  };

  const formattedSelectedDate = selectedDate.toLocaleDateString();

  const tasksForSelectedDate = tasks.filter((task: any) => {
    if (!task.dueDate) return false;
    const taskDueDate = new Date(task.dueDate).toLocaleDateString();
    return taskDueDate === formattedSelectedDate;
  });

  if (loading) {
    return <p>Chargement en cours...</p>;
  }

  if (!user || !token) {
    return <p>Veuillez vous connecter pour voir le calendrier.</p>;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-lg mb-6">
        <Calendar
          onChange={onChange as any}
          value={selectedDate}
          tileClassName={({ date, view }) => {
            if (view === 'month') {
              const hasTask = tasks.some(
                (task: any) =>
                  task.dueDate &&
                  new Date(task.dueDate).toLocaleDateString() ===
                    date.toLocaleDateString()
              );
              return hasTask ? 'has-task' : null;
            }
            return null;
          }}
          className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg text-gray-800 dark:text-gray-200"
        />
      </div>
      <Separator className="w-full max-w-lg mb-6" />
      <div className="w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Tâches pour le {formattedSelectedDate}
        </h2>
        {tasksForSelectedDate.length > 0 ? (
          <ul className="space-y-3">
            {tasksForSelectedDate.map((task: any) => (
              <li
                key={task.id}
                className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition"
              >
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Statut : {task.status}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground">
            Aucune tâche prévue pour cette date.
          </p>
        )}
      </div>
    </div>
  );
}
