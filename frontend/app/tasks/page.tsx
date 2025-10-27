import Link from 'next/link';
import { LayoutDashboard, Star } from 'lucide-react';

import AllTasks from './_components/AllTasks';
import MobileSidebar from './_components/MobileSidebar';
import { getAuthUser } from '@/lib/auth';
import SidebarButtons from './_components/SidebarButtons';
import { getTaskLists as getListsAction } from '@/actions/taskActions';
import PaymentNotification from './_components/PaymentNotification';

const NavLinks = () => (
  <nav aria-label="Navigation principale">
    <ul className="space-y-4">
      <li>
        <Link href="/tasks" className="flex items-center gap-2 hover:underline">
          <LayoutDashboard className="h-5 w-5" />
          Toutes les tâches
        </Link>
      </li>
      <li>
        <Link
          href="/tasks/favorites"
          className="flex items-center gap-2 hover:underline"
        >
          <Star className="h-5 w-5" />
          Favoris
        </Link>
      </li>
    </ul>
  </nav>
);

export default async function TasksPage() {
  const user = await getAuthUser();
  console.log(user);

  const taskLists = await getListsAction();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-64 flex-col border-r p-4 bg-background">
        <h2 className="text-xl font-semibold mb-6">Mes projets</h2>
        <NavLinks />
        <SidebarButtons taskLists={taskLists} user={user} />
      </aside>
      <MobileSidebar />
      <main className="flex-1 p-6">
        <PaymentNotification />
        <h1 className="text-2xl font-bold mb-4">Toutes les tâches</h1>
        <AllTasks user={user} />
      </main>
    </div>
  );
}
