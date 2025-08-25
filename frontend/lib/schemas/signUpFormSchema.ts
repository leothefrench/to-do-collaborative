import { z } from "zod";

export const signUpFormSchema = z.object({
  userName: z.string().min(3, {
    message: "Le nom d'utilisateur doit avoir au moins 3 caractères.",
  }),
  email: z.string().email('Veuillez saisir une adresse e-mail valide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
});

export type LoginFormValues = z.infer<typeof signUpFormSchema>;

export const signInFormSchema = z.object({
  email: z.string().email('Veuillez saisir une adresse e-mail valide'),
  password: z.string().min(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères.',
  }),
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;