'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const API_URL = 'http://localhost:3001';

export async function getUserTasks(token: string) {
  try {
    const res = await fetch(`${API_URL}/tasks`, {
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

export async function createTask(formData: FormData, token: string) {
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Échec de la création de la tâche');
    }

    revalidatePath('/tasks');
    redirect('/tasks');
  } catch (error) {
    console.error('Erreur lors de la création de la tâche :', error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
  }
}
