"use server";

export async function getUserTasks(token: string) {
  try {
    const res = await fetch('http://localhost:3001/task', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const tasks = await res.json();
    return tasks;
  } catch (error) {
    console.error('getUserTasks error:', error);
    return [];
  }
}
