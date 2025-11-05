'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link'; // Nécessaire pour le lien de retour
import { ArrowLeft, Loader2 } from 'lucide-react'; // Nécessaire pour l'icône de chargement
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';

// --- SCHÉMA ZOD ---
// Le formulaire de mot de passe oublié ne nécessite que l'email
const forgotPasswordFormSchema = z.object({
  email: z
    .string()
    .email({ message: 'Veuillez entrer une adresse email valide.' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  // Pas besoin de useRouter car on reste sur cette page après soumission (en général)

  // Utiliser la variable d'environnement correcte pour l'URL de votre backend
  const API_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: '',
    },
  });

  // --- LOGIQUE DE SOUMISSION ---
  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);

    try {
      // Endpoint typique pour demander un lien/code de réinitialisation
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || "Erreur lors de l'envoi du lien.";

        toast.error(errorMessage);
        return;
      }

      // Succès : Informer l'utilisateur de vérifier sa boîte mail
      toast.success('Lien envoyé !', {
        description: `Veuillez vérifier votre boîte mail à l'adresse ${values.email} pour réinitialiser votre mot de passe.`,
        duration: 8000, // Afficher plus longtemps
      });

      form.reset(); // Réinitialiser le champ email
    } catch (error) {
      console.error('Erreur réseau inattendue :', error);
      toast.error('Erreur serveur', {
        description:
          "Impossible de communiquer avec le service d'authentification.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Mot de passe oublié</CardTitle>
        <CardDescription>
          Entrez votre email. Nous vous enverrons un lien pour créer un nouveau
          mot de passe.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardContent className="grid gap-4">
            {/* Champ Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@example.com"
                      {...field}
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Envoyer le lien de réinitialisation'
              )}
            </Button>

            {/* Lien de retour à la connexion */}
            <Link
              href="/sign-in"
              className="text-sm font-medium text-primary hover:text-primary/80 flex items-center justify-center w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour à la connexion
            </Link>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
