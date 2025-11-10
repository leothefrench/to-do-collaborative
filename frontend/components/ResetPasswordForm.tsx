'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Assurez-vous que l'importation de types est correcte pour vous
import { ResetPasswordFormData } from '@/app/types';
import Link from 'next/link';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const ResetPasswordForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Récupération des paramètres de l'URL
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    newPassword: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. Vérification initiale du token
  useEffect(() => {
    // Le message d'erreur sera affiché dans le bloc 'Lien Invalide'
    if (!token || !email) {
      setError('Lien de réinitialisation invalide ou incomplet.');
    }
  }, [token, email]);

  const API_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 3. Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Jeton de sécurité manquant. Veuillez refaire une demande.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Mot de passe réinitialisé avec succès !');
        setTimeout(() => {
          // Redirection dans le même onglet vers la page de connexion
          router.push('/sign-in');
        }, 3000);
      } else {
        setError(data.message || 'Erreur lors de la réinitialisation.');
      }
    } catch (err) {
      console.error('Erreur API:', err);
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Affichage pour les liens invalides
  if (!token || !email) {
    return (
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">
            Lien Invalide
          </CardTitle>
          <CardDescription className="dark:text-gray-300">
            {error}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary/80 flex items-center justify-center w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Demander un nouveau lien
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // 5. Affichage du formulaire de réinitialisation
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Réinitialisation du mot de passe</CardTitle>
        <CardDescription className="sr-only">
          Définir un nouveau mot de passe pour l'adresse : **{email}**
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <CardContent className="grid gap-4">
          {/* Messages de succès/erreur */}
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:border-red-700 dark:text-red-300"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {message && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative dark:bg-green-900 dark:border-green-700 dark:text-green-300"
              role="alert"
            >
              <span className="block sm:inline">{message}</span>
            </div>
          )}

          {/* Champ Nouveau Mot de Passe */}
          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium">
              Nouveau Mot de Passe
            </label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
              placeholder="Entrez votre nouveau mot de passe"
              value={formData.newPassword}
              onChange={handleChange}
            />
          </div>

          {/* Champ Confirmation Mot de Passe */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmer le Mot de Passe
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              placeholder="Confirmez le nouveau mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !!error}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </Button>

          <Link
            href="/sign-in"
            className="text-sm font-medium text-primary hover:text-primary/80 flex items-center justify-center w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour à la connexion
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
};
