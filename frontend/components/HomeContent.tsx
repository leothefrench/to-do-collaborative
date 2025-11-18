'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomeContent({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold">
        Gagne en clarté,
        <span className="text-green-500">agis sans attendre.</span>
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-xl">
        Un tableau simple, rapide, pour enfin <strong>avancer</strong>.
      </p>
      {isLoggedIn ? (
        <div className="flex flex-col items-center mt-6">
          <p className="text-lg font-medium mb-4">
            Bienvenue <span className="text-green-600">!</span> 👋
          </p>

          <div className="flex space-x-4">
            <Link href="/tasks">
              <Button>Voir mes tâches</Button>
            </Link>

            <Link href="/profile">
              <Button variant="secondary">Mon profil</Button>
            </Link>
          </div>
        </div>
      ) : (

        <div className="flex flex-col items-center mt-6">
          <div className="flex space-x-4">
            <Link href="/sign-in">
              <Button>Se connecter</Button>
            </Link>

            <Link href="/sign-up">
              <Button variant="secondary">S&apos;inscrire</Button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
