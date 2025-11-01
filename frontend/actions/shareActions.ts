'use server';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
import { getAuthToken } from '@/lib/auth';
interface ShareResponse {
  success: boolean;
  message: string;
  trialActivated?: boolean;
}
export async function shareTaskListAction(
  listId: string,
  collaboratorUserName: string
): Promise<ShareResponse> {
  const token = await getAuthToken();
  try {
    const response = await fetch(`${BACKEND_URL}/tasklists/${listId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ collaboratorUserName }),
    });
    const data = await response.json();
    if (response.ok) {
      return {
        success: true,
        message: data.message || 'Collaborateur ajouté avec succès !',
        trialActivated: !!data.trialActivated,
      };
    } else {
      return {
        success: false,
        message: data.message || `Erreur (${response.status}) lors du partage.`,
      };
    }
  } catch (error) {
    console.error('Erreur lors du partage via Server Action:', error);
    return {
      success: false,
      message: 'Erreur de connexion au service de partage.',
    };
  }
}
