
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function createCheckoutSession() {
  try {
    const response = await fetch(`${API_URL}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message:
          errorData.message ||
          'Échec de la création de la session de paiement.',
      };
    }

    const data: { url: string } = await response.json();

    return { success: true, url: data.url };
  } catch (error) {
    console.error("Erreur lors de l'appel API Stripe:", error);
    return {
      success: false,
      message: 'Une erreur inattendue est survenue.',
    };
  }
}
