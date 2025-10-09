// Fichier : components/SignInForm.tsx (Correction finale)

'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react'; // ❌ SUPPRESSION: Retrait de useEffect et useState dépendants du contexte
import { useRouter } from 'next/navigation';

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

const signInFormSchema = z.object({
  email: z.string().email({ message: 'Email invalide' }),
  password: z
    .string()
    .min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
});

type SignInFormValues = z.infer<typeof signInFormSchema>;

export const SignInForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: '',
      password: '',
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

  const onSubmit = async (values: SignInFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur de connexion');
      }

      // Le serveur Fastify a défini le cookie 'token' ici

      // ❌ SUPPRESSION: On n'appelle plus login() du contexte
      // await login();

      // Redirection après succès
      router.push('/tasks');
      router.refresh(); // Force la revalidation du cache (et du Header SC)
      form.reset();
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Entrez vos identifiants pour accéder à vos tâches
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardContent className="grid gap-4">
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
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              Se connecter
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
