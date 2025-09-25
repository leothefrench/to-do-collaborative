'use server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function searchUsers(searchTerm: string) {
  if (!searchTerm || searchTerm.length < 3) {
    return [];
  }

  try {
    const res = await fetch(`${BACKEND_URL}/users/search?q=${searchTerm}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`Erreur lors de la recherche : ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Échec de la recherche des utilisateurs :', error);
    return [];
  }
}