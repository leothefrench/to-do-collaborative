'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createCheckoutSession } from '@/actions/billingAction';

export function SubscribeButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    // 1. Appel de l'action pour créer la session Checkout (appelle Fastify)
    const result = await createCheckoutSession();

    if (result.success && result.url) {
      // 2. Succès : Redirection de l'utilisateur vers la page Stripe
      toast.info('Redirection vers la page de paiement...');
      window.location.href = result.url;

      // Note: Le code après la redirection ne sera pas exécuté, mais on garde
      // l'état isLoading à true jusqu'à ce que la page change.
    } else {
      // 3. Échec : Afficher l'erreur
      toast.error(result.message || "Échec de l'initialisation du paiement.");
      setIsLoading(false); // Réactiver le bouton
    }
  };

  return (
    <Button variant="default" onClick={handleClick} disabled={isLoading}>
      {isLoading ? 'Chargement...' : 'Mettre à niveau vers Pro'}
    </Button>
  );
}
