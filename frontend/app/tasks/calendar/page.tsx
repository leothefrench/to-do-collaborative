import { Suspense } from 'react';
import Calendar from '../_components/Calendar';
import Loading from './loading';

export default function CalendarPage() {
  return (
    <main className="flex flex-col items-center p-6 w-full">
      <h1 className="text-2xl font-bold mb-4">Calendrier des tâches</h1>
      <Suspense fallback={<Loading />}>
        <div className="w-full max-w-lg mx-auto">
          <Calendar />
        </div>
      </Suspense>
    </main>
  );
}
