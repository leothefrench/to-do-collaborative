'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ModeToggle } from '@/components/ModeToggle';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const Links = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Calendrier',
    href: '/tasks/calendar',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];

export const Navbar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, loading, logout } = useAuthContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav
      className="flex justify-between items-center p-4"
      aria-label="Main navigation"
    >
      <div className="flex items-center space-x-6">
        <Link href="/">
          <div className="flex items-center space-x-2">
            {mounted && (
              <Image
                src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
                alt="NoProcras Logo"
                width={32}
                height={32}
              />
            )}
            <span className="font-bold text-gray-800 hidden md:inline">
              <span className="text-[#22c55e]">No</span>Procras
            </span>
            <span className="sr-only">NoProcras</span>
          </div>
        </Link>
        <ul className="hidden md:flex space-x-2 mr-2">
          {Links.map((item, index) => (
            <li key={index}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" aria-describedby="sheet-desc">
            <SheetHeader>
              <SheetTitle className="text-left">Menu</SheetTitle>
              <p id="sheet-desc" className="sr-only">
                Navigation principale du site, options disponibles
              </p>
            </SheetHeader>
            <ul className="mt-4 space-y-4">
              {Links.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="block"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex items-center space-x-4">
        {loading ? null : user ? (
          <>
            <Button asChild variant="secondary" className="h-9">
              <Link href="/profile">Profil</Link>
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="h-9"
            >
              Logout
            </Button>
          </>
        ) : (
          <Button asChild variant="secondary" className="h-9">
            <Link href="/sign-up">s&apos;inscrire</Link>
          </Button>
        )}
        <ModeToggle />
      </div>
    </nav>
  );
};
