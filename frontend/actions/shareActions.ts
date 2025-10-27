// DANS frontend/actions/shareActions.ts

'use server';

// Importez l'URL de votre backend depuis un fichier de configuration ou l'environnement
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Assurez-vous d'avoir une fonction d'authentification pour récupérer le token ou l'ID utilisateur
import { getAuthToken } from '@/lib/auth'; // ⬅️ ASSUMONS CETTE FONCTION EXISTE

interface ShareResponse {
  success: boolean;
  message: string;
}

export async function shareTaskListAction(
  listId: string,
  collaboratorUserName: string
): Promise<ShareResponse> {
  // Récupérer le token ou l'ID utilisateur pour authentification Fastify
  const token = await getAuthToken();

  try {
    // Appel direct à votre API Fastify depuis le serveur Next.js (pas de CORS ici)
    const response = await fetch(`${BACKEND_URL}/tasklists/${listId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Utilisation du token pour l'authentification Fastify
      },
      body: JSON.stringify({ collaboratorUserName }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || 'Collaborateur ajouté avec succès !',
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
