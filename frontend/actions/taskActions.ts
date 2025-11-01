'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const API_URL = 'http://localhost:3001';

// 🛠️ UTILITIES POUR AUTHENTIFICATION ET ERREURS
// -----------------------------------------------------

// Fonction pour récupérer le token JWT du cookie HttpOnly (côté Server Action)
async function getTokenFromCookie(): Promise<string> {
  const tokenCookie = (await cookies()).get('token');
  if (!tokenCookie || !tokenCookie.value) {
    // Cela sera attrapé dans le bloc try/catch et affichera un message d'erreur
    throw new Error('Non autorisé: Session expirée ou non trouvée.');
  }
  return tokenCookie.value;
}

// Fonction pour gérer les erreurs 'unknown' de TypeScript de manière sécurisée
function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return String(error);
}

export async function createTask(formData: FormData) {
  // ❌ Suppression de l'argument token
  const data = {
    title: formData.get('title'),
    description: formData.get('description'),
    status: formData.get('status'),
    dueDate: formData.get('dueDate'),
    priority: formData.get('priority'),
    taskListId: formData.get('taskListId'),
  };

  try {
    const token =   await getTokenFromCookie(); 

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
    const errorMessage = toErrorMessage(error); // ✅ Utilisation de toErrorMessage
    console.error('Erreur lors de la création de la tâche :', errorMessage);

    return {
      success: false,
      message: errorMessage || 'Une erreur inattendue est survenue.',
    };
  }
}

export async function deleteTask(taskId: string) {

  try {
    const token = await getTokenFromCookie();

    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      // On lance une erreur qui sera attrapée par le bloc catch
      throw new Error(
        errorData.message || 'Échec de la suppression de la tâche.'
      );
    }

    revalidatePath('/tasks');
  } catch (error) {
    const errorMessage = toErrorMessage(error);
    console.error('Erreur lors de la suppression de la tâche:', errorMessage);

    return {
      error: errorMessage || 'Erreur lors de la suppression de la tâche',
    };
  }
}
export async function getTaskLists() {
  try {
    const token = await getTokenFromCookie();
    
    const res = await fetch(
      'http://localhost:3001/tasklists',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch task lists');
    }

    const taskLists = await res.json();
    console.log("Données reçues pour les listes de tâches (vérification partage) :", taskLists);
    return taskLists;
  } catch (error) {
    const errorMessage = toErrorMessage(error);
    console.error('getTaskLists error:', errorMessage); // Retourne un tableau vide en cas d'erreur pour ne pas casser l'interface

    return [];
  }
}

export async function createTaskList(formData: FormData) {

  const data = Object.fromEntries(formData.entries());

  try {
    const token = await getTokenFromCookie();

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
    const errorMessage = toErrorMessage(error); 
    console.error(
      'Erreur lors de la création de la liste de tâches :',
      errorMessage
    );

    return { success: false, message: errorMessage || 'Erreur inattendue.' };
  }
}

export async function getTasksByTaskListId(taskListId: string) {
  try {
    const token = await getTokenFromCookie();
    const res = await fetch(`${API_URL}/tasks?taskListId=${taskListId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Échec de la récupération des tâches pour cette liste.');
    }

    const tasks = await res.json();

    // ✅ AJOUT DE LA LIGNE DE DÉBOGAGE
    console.log(
      `IDs de tâches reçus pour la liste ${taskListId}:`,
      tasks.map((t) => t.id)
    );

    return tasks;
  } catch (error) {
    const errorMessage = toErrorMessage(error);
    console.error('getTasksByTaskListId error:', errorMessage); // Retourne un tableau vide en cas d'erreur

    return [];
  }
}