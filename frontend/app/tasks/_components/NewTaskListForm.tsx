'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
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

import { createTaskList } from '@/actions/taskActions';

const taskListSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
});

type TaskListFormValues = z.infer<typeof taskListSchema>;

type NewTaskListFormProps = {
  onClose: () => void;
};

export default function NewTaskListForm({ onClose }: NewTaskListFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const form = useForm<TaskListFormValues>({
    resolver: zodResolver(taskListSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const { mutate, isPending: isMutating } = useMutation({
    mutationFn: async (data: TaskListFormValues) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');

      const result = await createTaskList(formData);

      if (result && result.success === false) {
        throw new Error(result.message);
      }
      return result;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskLists'], exact: false });

      startTransition(() => {
        router.refresh();
      });
      toast.success('Liste créée avec succès !');
      form.reset();
      onClose(); 
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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