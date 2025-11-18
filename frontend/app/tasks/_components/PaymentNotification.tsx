'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentNotification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {

    const paymentStatus = searchParams.get('payment');

    if (paymentStatus === 'success') {
      setShowSuccess(true);
      router.replace('/tasks', { scroll: false });

      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  if (!showSuccess) {
    return null;
  }

  // ⚠️ Remplacez ceci par un vrai composant de bannière ou de toast
  return (
    <div className="bg-green-500 text-white p-4 rounded-lg mb-4 text-center">
      Félicitations ! Votre abonnement **Premium** est actif. Bienvenue sur
      votre Tableau de Bord.
    </div>
  );
}
