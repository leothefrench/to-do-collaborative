'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const taskSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  deadline: z.string().min(1, 'La deadline est requise'),
});

type TaskFormValues = z.infer<typeof taskSchema>;

type NewTaskFormProps = {
  open: boolean;
  onClose: () => void;
};

export default function NewTaskForm({ open, onClose }: NewTaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      deadline: '',
    },
  });

  const onSubmit = (data: TaskFormValues) => {
    console.log('📌 Nouvelle tâche :', data);
    // TODO : brancher Prisma + Neon (server action)
    form.reset()
    onClose()
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Créer une nouvelle tâche</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 mt-4"
          aria-label="Formulaire de création de tâche"
        >
          {/* Titre */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              placeholder="Entrez un titre"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Détails de la tâche"
              {...form.register('description')}
            />
          </div>

          {/* Deadline */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input id="deadline" type="date" {...form.register('deadline')} />
            {form.formState.errors.deadline && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.deadline.message}
              </p>
            )}
          </div>

          {/* Bouton de soumission */}
          <Button type="submit" className="mt-2">
            Ajouter la tâche
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
