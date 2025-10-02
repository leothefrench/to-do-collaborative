// /components/SignUpForm.tsx - CORRIGÉ

'use client';

import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';

// Import of validation schema and type inference
import {
  signUpFormSchema,
  LoginFormValues,
} from '../lib/schemas/signUpFormSchema';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';

export const SignUpForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { login, user } = useAuthContext();

  useEffect(() => {
    if (user) {
      router.push('/'); // Rediriger vers la Landing Page après l'inscription/connexion
    }
  }, [user, router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      userName: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof signUpFormSchema>) {
    console.log(values);

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Une erreur est survenue lors de l'inscription"
        );
      }
      const result = await response.json();
      console.log('Inscription réussie:', result);

      await login();

      router.push('/tasks'); // Redirection vers une page protégée après l'inscription/connexion

      form.reset();
    } catch (error) {
      console.log('Error during registration:', error); // Message for User
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Inscription</CardTitle>
        <CardDescription>
          Créez votre compte pour accéder à vos tâches
        </CardDescription>
      </CardHeader>

      {/* 🎯 CORRECTION: <Form> enveloppe maintenant le formulaire et les CardSections 🎯 */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom d&apos;utilisateur</FormLabel>
                  <FormControl>
                    <Input placeholder="JohnDoe" {...field} />
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
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="votre@email.com" {...field} />
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
            <Button className="w-full" type="submit" disabled={isLoading}>
              S&apos;enregister
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
