// Fichier : app/tasks/calendar/page.tsx (Correction)

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

// Assurez-vous d'avoir bien créé ce fichier et cette fonction
import { verifyAuth } from '@/lib/auth';

import CalendarComponent from '../_components/Calendar'; // Renommé ici comme dans votre fichier
import Loading from './loading';

export default async function CalendarPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const authResult = await verifyAuth(token); // Redirection si l'utilisateur n'est pas authentifié
  if (!authResult.isLoggedIn || !authResult.user) {
    redirect('/sign-in');
  }

  return (
    <main className="flex flex-col items-center p-6 w-full">
      <h1 className="text-2xl font-bold mb-4">Calendrier des tâches</h1>

      <Suspense fallback={<Loading />}>
        <div className="w-full max-w-lg mx-auto">
          {/* ⚠️ L'utilisateur authentifié est passé en prop au composant Client */}
          <CalendarComponent user={authResult.user} />
        </div>
      </Suspense>
    </main>
  );
}
