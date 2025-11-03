'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Lock, Loader2 } from 'lucide-react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// Assurez-vous que le chemin ci-dessous est correct pour votre schéma Zod
import {
  ChangePasswordSchema,
  ChangePasswordFormValues,
} from '@/lib/schemas/authSchemas';

// Import de Sonner pour les notifications
import { toast } from 'sonner';

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);

  // Utiliser la variable d'environnement correcte pour l'URL de votre backend
  const API_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    // Nous envoyons seulement oldPassword et newPassword à l'API Fastify
    const { oldPassword, newPassword } = values;

    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Nécessaire pour envoyer le cookie d'authentification Fastify
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Gestion de l'erreur 401: Ancien mot de passe incorrect
        if (
          response.status === 401 &&
          errorData.message.includes('incorrect')
        ) {
          toast.error('Échec de la mise à jour', {
            description: errorData.message, // "L'ancien mot de passe est incorrect."
          });
          return;
        }

        throw new Error(
          errorData.message ||
            'Erreur inconnue lors du changement de mot de passe.'
        );
      }

      // Succès
      toast.success('Succès !', {
        description: 'Votre mot de passe a été mis à jour.',
      });

      form.reset(); // Réinitialise le formulaire
      setOpen(false); // Ferme la modale
    } catch (error) {
      console.error('Erreur de soumission :', error);
      toast.error('Erreur serveur', {
        description: 'Impossible de communiquer avec le service de sécurité.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Le bouton qui déclenche l'ouverture de la modale (Déjà dans page.tsx) */}
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Lock className="h-4 w-4 mr-2" /> Changer le mot de passe
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mettre à jour le mot de passe</DialogTitle>
          <DialogDescription>
            Entrez votre mot de passe actuel et votre nouveau mot de passe.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 1. ANCIEN MOT DE PASSE */}
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ancien mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Mot de passe actuel"
                      {...field}
                    />
                  </FormControl>
                  <Link
                    href="/forgot-password" 
                    className="text-sm text-primary hover:text-primary/80 hover:underline block text-right pt-1"
                    onClick={() => setOpen(false)} 
                  >
                    Mot de passe oublié ?       
                  </Link>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. NOUVEAU MOT DE PASSE */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Minimum 8 caractères"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3. CONFIRMATION NOUVEAU MOT DE PASSE */}
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirmer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BOUTON DE SOUMISSION */}
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Mettre à jour le mot de passe'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
