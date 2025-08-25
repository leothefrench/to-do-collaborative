import { z } from 'zod';

export const signInFormSchema = z.object({
  email: z.string().email('Veuillez saisir une adresse e-mail valide'),
  password: z.string().min(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères.',
  }),
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;
