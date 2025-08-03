import { z } from "zod";

export const loginFormSchema = z.object({
  userName: z.string().min(3, {
    message: "Le nom d'utilisateur doit avoir au moins 3 caractères.",
  }),
  email: z.string().email('Veuillez saisir une adresse e-mail valide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;