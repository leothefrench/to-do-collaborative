'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const taskListSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
});

type TaskListFormValues = z.infer<typeof taskListSchema>;

export default function NewTaskListForm() {
  const form = useForm<TaskListFormValues>({
    resolver: zodResolver(taskListSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = (data: TaskListFormValues) => {
    console.log('📌 Nouvelle liste de tâches :', data);
    // TODO : appel backend / server action
    form.reset();

    toast.success('Liste créée avec succès !');
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

        <Button type="submit" className="mt-2">
          Ajouter la liste
        </Button>
      </form>
    </SheetContent>
  );
}
