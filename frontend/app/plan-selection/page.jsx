'use client';

import { Button } from '@/components/ui/button';
import { Check, Zap, Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Fonction pour gérer l'appel API (Utilisation de la même logique que celle discutée précédemment)
async function handleSubscription(planType, setIsLoading) {
  setIsLoading(true);

  const endpoint =
    planType === 'PREMIUM'
      ? 'http://localhost:3001/billing/subscribe'
      : 'http://localhost:3001/billing/select-free-plan';

  const bodyPayload = JSON.stringify({
    plan: planType,
  });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: bodyPayload,
    });

    if (!response.ok) {
      let errorData;

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        throw new Error(
          `Erreur du serveur (code ${response.status}). La route Fastify '${endpoint}' est manquante ou mal configurée.`
        );
      }

      toast.error(
        errorData.message || `Échec de l'action pour le plan ${planType}.`
      );
      return;
    }

    const data = await response.json();

    if (planType === 'PREMIUM') {
      if (data.url) {
        toast.info('Redirection vers la page de paiement Stripe...');
        window.location.href = data.url;
      } else {
        toast.success('Votre plan PREMIUM a été activé !');
        window.location.href = '/tasks';
      }
    } else {
      toast.success('Votre plan GRATUIT a été confirmé !');
      window.location.href = '/tasks';
    }
  } catch (error) {
    console.error('Erreur réseau/inattendue:', error);
    toast.error(
      error.message || 'Impossible de contacter le serveur de facturation.'
    );
  } finally {
    setIsLoading(false);
  }
}

// Composant de Carte de Plan
const PlanCard = ({
  title,
  price,
  featuresList,
  isPremium,
  onClick,
  isLoading,
}) => {
  const baseClasses =
    'flex flex-col p-8 rounded-2xl transition-all duration-300 shadow-2xl h-full';
  const freeClasses =
    'bg-gray-800 border border-gray-700 hover:border-blue-500';
  const premiumClasses =
    'bg-gray-900 border-2 border-yellow-500 ring-2 ring-yellow-500 hover:ring-yellow-400 relative';
  const buttonClasses = isPremium
    ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400'
    : 'bg-blue-600 text-white hover:bg-blue-500';

  return (
    <div
      className={
        isPremium
          ? `${baseClasses} ${premiumClasses}`
          : `${baseClasses} ${freeClasses}`
      }
    >
      {isPremium && (
        <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-yellow-500 text-gray-900 text-sm font-bold px-3 py-1 rounded-full shadow-md transform rotate-3">
          Populaire
        </div>
      )}

      <header className="text-center pb-6">
        <h2
          className={`text-3xl font-extrabold ${
            isPremium ? 'text-yellow-400' : 'text-white'
          }`}
        >
          {title}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {isPremium
            ? 'Débloquez un potentiel illimité.'
            : 'Le point de départ idéal.'}
        </p>
      </header>

      <div className="text-center mb-6">
        <div className="text-5xl font-extrabold text-white">
          {price}
          <span className="text-xl font-normal text-gray-400">/mois</span>
        </div>
      </div>

      <ul className="space-y-4 flex-grow mb-8 text-gray-300">
        {featuresList.map((feature, index) => (
          <li key={index} className="flex items-start">
            {isPremium ? (
              <Zap className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
            ) : (
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            )}
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <footer className="pt-6">
        <Button
          onClick={onClick}
          disabled={isLoading}
          className={`w-full py-6 text-lg font-semibold flex items-center justify-center space-x-2 transition duration-200 ${buttonClasses}`}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : isPremium ? (
            'Passer au Premium'
          ) : (
            'Continuer gratuitement'
          )}
          {!isLoading &&
            (isPremium ? (
              <ArrowRight className="h-5 w-5" />
            ) : (
              <Check className="h-5 w-5" />
            ))}
        </Button>
      </footer>
    </div>
  );
};

export default function PlanSelectionPage() {
  const [isLoading, setIsLoading] = useState(false);

  const premiumFeatures = [
    'Listes et Tâches ILLIMITÉES',
    'Partage de listes avancé (lecture/écriture)',
    'Support prioritaire 24/7 (chat)',
    'Fonctionnalités IA futures (Génération, résumé)',
  ];

  const freeFeatures = [
    'Toutes les fonctionnalités de base',
    'Synchronisation multi-appareils',
    'Historique des tâches basique',
    'Support communautaire (forum)',
    'Limite de 3 listes de tâches.',
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-950 text-white">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
        Choisissez votre plan
      </h1>
      <p className="text-xl text-gray-400 mb-10 text-center max-w-2xl">
        Commencez gratuitement dès maintenant, ou passez au Premium pour un
        usage illimité.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full items-stretch">
        <PlanCard
          title="Plan Gratuit (FREE)"
          price="0€"
          featuresList={freeFeatures}
          isPremium={false}
          onClick={() => handleSubscription('FREE', setIsLoading)}
          isLoading={isLoading}
        />

        <PlanCard
          title="Plan Premium"
          price="5€"
          featuresList={premiumFeatures}
          isPremium={true}
          onClick={() => handleSubscription('PREMIUM', setIsLoading)}
          isLoading={isLoading}
        />
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Vous pouvez changer de plan à tout moment depuis votre page de profil.
      </p>
    </main>
  );
}
