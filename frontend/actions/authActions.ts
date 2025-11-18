'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
  (await cookies()).delete('token');
  redirect('/sign-in');
}

export async function isLoggedIn() {
  const cookieStore = cookies();
  const tokenCookie = (await cookieStore).get('token');

  return !!tokenCookie?.value;
}