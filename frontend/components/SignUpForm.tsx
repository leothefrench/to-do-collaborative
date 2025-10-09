// Fichier : components/SignUpForm.tsx (Correction finale)

'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react'; // ❌ SUPPRESSION: Retrait de useEffect et useState dépendants du contexte
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ❌ SUPPRESSION: On retire l'ancien contexte d'authentification
// import { useAuthContext } from '@/context/AuthContext';
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

const signUpFormSchema = z
  .object({
    name: z.string().min(2, { message: 'Le nom est requis' }),
    email: z.string().email({ message: 'Email invalide' }),
    password: z
      .string()
      .min(6, {
        message: 'Le mot de passe doit contenir au moins 6 caractères',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type SignUpFormValues = z.infer<typeof signUpFormSchema>;

export const SignUpForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // ❌ SUPPRESSION: On retire la destructuration du contexte
  // const { login, user } = useAuthContext();

  // ❌ SUPPRESSION: On retire la règle de redirection côté client
  /*
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);
  */

  const onSubmit = async (values: SignUpFormValues) => {
    setIsLoading(true);
    // On retire le confirmPassword avant d'envoyer au backend
    const { confirmPassword, ...dataToSend } = values;

    try {
      const response = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur d'inscription");
      }

      // Le serveur Fastify a défini le cookie 'token' ici (si c'est le comportement)

      // ❌ SUPPRESSION: On n'appelle plus login() du contexte
      // await login();

      // Redirection après succès. Le router.refresh() force la revalidation.
      router.push('/tasks');
      router.refresh();
      form.reset();
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Inscription</CardTitle>
        <CardDescription>
          Créez un compte pour commencer à gérer vos tâches.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Votre nom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer le mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              S&apos;inscrire
            </Button>
            <p className="text-sm text-center text-gray-500">
              Vous avez déjà un compte ?{' '}
              <Link href="/sign-in" className="text-blue-500 hover:underline">
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
