'use server';

import { revalidatePath } from 'next/cache';

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

    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      status: formData.get('status'),
      dueDate: formData.get('dueDate'),
      priority: formData.get('priority'),
      taskListId: formData.get('taskListId'),
    };

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
      return {
        success: false,
        message: errorData.message || 'Échec de la création de la tâche',
      };
    }

    revalidatePath('/dashboard');
    return { success: true, message: 'Tâche créée avec succès' };
  } catch (error) {
    console.error('Erreur lors de la création de la tâche :', error);
    return { success: false, message: 'Une erreur inattendue est survenue.' };
  }
}

// Server Action pour la suppression d'une tâche
export async function deleteTask(taskId: string, token: string) {
  try {
    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Échec de la suppression de la tâche.');
    }

    // 🟢 Met à jour le cache de la page pour rafraîchir l'interface
    revalidatePath('/tasks');
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error);
    return { error: 'Erreur lors de la suppression de la tâche' };
  }
}

export async function getTaskLists(token: string) {
  try {
    const res = await fetch('http://localhost:3001/tasklists', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch task lists');
    }

    const taskLists = await res.json();
    return taskLists;
  } catch (error) {
    console.error('getTaskLists error:', error);
    return [];
  }
}

export async function createTaskList(formData: FormData, token: string) {
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(`${API_URL}/tasklists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Échec de la création.',
      };
    }

    revalidatePath('/dashboard');
    return { success: true, message: 'Liste créée avec succès !' };
  } catch (error) {
    console.error('Erreur lors de la création de la liste de tâches :', error);
    return { success: false, message: 'Erreur inattendue.' };
  }
}