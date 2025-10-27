import * as z from 'zod';

export const ChangePasswordSchema = z
  .object({
    // Le nom des champs doit correspondre à ce que Fastify attend (oldPassword, newPassword)
    oldPassword: z
      .string()
      .min(1, { message: "L'ancien mot de passe est requis." }),

    newPassword: z
      .string()
      .min(8, {
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
      }),

    confirmNewPassword: z
      .string()
      .min(1, { message: 'La confirmation du mot de passe est requise.' }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    // Condition de validation personnalisée : vérifie si le nouveau mot de passe correspond à sa confirmation.
    message: 'Les nouveaux mots de passe ne correspondent pas.',
    path: ['confirmNewPassword'], // Affiche l'erreur sur le champ de confirmation
  });

// TYPESCRIPT : Pour dériver le type à partir du schéma
export type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>;
