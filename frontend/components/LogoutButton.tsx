// Fichier : components/LogoutButton.tsx (Correction)

'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

import { logout } from '@/actions/authActions';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();

    // router.refresh();
    // router.push('/');
    router.push('/sign-in');
  };

  return (
    <Button onClick={handleLogout} variant="destructive" className="h-9">
      Logout
    </Button>
  );
}
