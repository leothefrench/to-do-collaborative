'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { logout } from '@/actions/authActions';

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logout();
    });
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isPending}
      variant="destructive"
      className="w-full sm:w-auto"
    >
      {isPending ? 'Déconnexion...' : 'Se Déconnecter'}
    </Button>
  );
}
