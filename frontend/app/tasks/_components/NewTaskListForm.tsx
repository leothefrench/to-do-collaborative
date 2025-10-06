'use client';

// 🟢 AJOUT : Imports pour gérer la navigation et le rafraîchissement des données.
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
// 🟢 AJOUT : Imports de TanStack Query pour la gestion des mutations et du cache.
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// 🟢 AJOUT : Import de la Server Action pour la création de la liste de tâches.
import { createTaskList } from '@/actions/taskActions';

const taskListSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
});

type TaskListFormValues = z.infer<typeof taskListSchema>;

// ❌ SUPPRESSION : L'interface n'a plus besoin du token
type NewTaskListFormProps = object

// ❌ SUPPRESSION : Retrait de { token } des props
export default function NewTaskListForm({}: NewTaskListFormProps) { 
  // 🟢 AJOUT : On récupère l'instance du routeur et du client de requête pour gérer la navigation et le cache.
  const router = useRouter();
  const queryClient = useQueryClient();
  // 🟢 AJOUT : useTransition gère l'état de la soumission pour l'interface utilisateur.
  const [isPending, startTransition] = useTransition();

  const form = useForm<TaskListFormValues>({
    resolver: zodResolver(taskListSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // 🟢 AJOUT : useMutation pour appeler la Server Action et gérer les états asynchrones.
  const { mutate, isPending: isMutating } = useMutation({
    mutationFn: async (data: TaskListFormValues) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');

      // ❌ MODIFICATION CRUCIALE : createTaskList est appelée SANS le token
      const result = await createTaskList(formData); 
      
      if (result && result.success === false) {
        throw new Error(result.message);
      }
      return result;
    },
    // 🟢 AJOUT : Gère le succès de la mutation.
    onSuccess: () => {
      // ❌ MODIFICATION : Le queryKey doit être ajusté pour ne pas dépendre du token
      // Nous invalidons ['taskLists'] ou ['taskLists', user?.id] si l'ID est disponible
      // Comme l'ID utilisateur est géré par le Server Action, nous pouvons invalider ['taskLists']
      queryClient.invalidateQueries({ queryKey: ['taskLists'], exact: false }); 
      
      // Rafraîchit la page côté serveur pour garantir que la nouvelle liste apparaît.
      startTransition(() => {
        router.refresh();
      });
      // Affiche une notification de succès.
      toast.success('Liste créée avec succès !');
      // Réinitialise le formulaire.
      form.reset();
    },
    // 🟢 AJOUT : Gère l'erreur de la mutation.
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // 🟢 MODIFICATION : onSubmit appelle maintenant la fonction `mutate` du hook `useMutation`.
  const onSubmit = (data: TaskListFormValues) => {
    mutate(data);
  };

  return (
    <SheetContent side="right" className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Créer une nouvelle liste</SheetTitle>
      </SheetHeader>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 mt-4"
        aria-label="Formulaire de création de liste de tâches"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            placeholder="Nom de la liste"
            {...form.register('name')}
          />
          {form.formState.errors.name && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Description optionnelle"
            {...form.register('description')}
          />
        </div>
        {/* 🟢 MODIFICATION : Le bouton est désactivé pendant la soumission. */}
        <Button
          type="submit"
          className="mt-2"
          disabled={isMutating || isPending}
        >
          {isMutating || isPending ? 'Création...' : 'Ajouter la liste'}
        </Button>
      </form>
    </SheetContent>
  );
}