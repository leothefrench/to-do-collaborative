'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { createTask } from '@/actions/taskActions';

type TaskList = {
  id: string;
  name: string;
};


const taskSchema = z.object({
  title: z.string().min(1, 'Le titre est requis.'),
  description: z.string().min(0, 'La description est requise.'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().min(0, "La date d'échéance est requise."),
  taskListId: z.string().min(1, 'La liste est requise.'),
});

type TaskFormValues = z.infer<typeof taskSchema>;

type NewTaskFormProps = {
  taskLists: TaskList[];
};

export default function NewTaskForm({ taskLists }: NewTaskFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

const form = useForm<TaskFormValues>({
  resolver: zodResolver(taskSchema),
  defaultValues: {
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    taskListId: '',
  },
});

  // 🟢 MODIFICATION : useMutation pour appeler la Server Action et gérer les états asynchrones
  const { mutate, isPending: isMutating } = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      const result = await createTask(formData);
      if (result && result.success === false) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      startTransition(() => {
        router.refresh();
      });
      toast.success('Tâche créée avec succès !');
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // 🟢 MODIFICATION : onSubmit appelle la fonction `mutate` du hook `useMutation`
  const onSubmit = (data: TaskFormValues) => {
    const formattedData = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : '',
    };
    mutate(formattedData);
  };

  return (
    <SheetContent side="right" className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Créer une nouvelle tâche</SheetTitle>
      </SheetHeader>

      {/* 🟢 MODIFICATION : Le formulaire utilise onSubmit de react-hook-form */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 mt-4"
        aria-label="Formulaire de création de tâche"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="taskListId">Liste</Label>
          {/* 🟢 MODIFICATION : Le Select utilise onValueChange pour la gestion de l'état */}
          <Select
            onValueChange={(value) => form.setValue('taskListId', value)}
            defaultValue={form.getValues('taskListId')}
          >
            <SelectTrigger id="taskListId">
              <SelectValue placeholder="Sélectionner une liste" />
            </SelectTrigger>
            <SelectContent>
              {taskLists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  {list.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.taskListId && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.taskListId.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Titre</Label>
          {/* 🟢 MODIFICATION : L'Input utilise la fonction register */}
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          {/* 🟢 MODIFICATION : Le Textarea utilise la fonction register */}
          <Textarea
            id="description"
            placeholder="Détails de la tâche"
            {...form.register('description')}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Statut</Label>
          {/* 🟢 MODIFICATION : Le Select utilise onValueChange */}
          <Select
            onValueChange={(value) =>
              form.setValue('status', value as 'TODO' | 'IN_PROGRESS' | 'DONE')
            }
            defaultValue={form.getValues('status')}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">À faire</SelectItem>
              <SelectItem value="IN_PROGRESS">En cours</SelectItem>
              <SelectItem value="DONE">Terminé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="priority">Priorité</Label>
          {/* 🟢 MODIFICATION : Le Select utilise onValueChange */}
          <Select
            onValueChange={(value) =>
              form.setValue('priority', value as 'LOW' | 'MEDIUM' | 'HIGH')
            }
            defaultValue={form.getValues('priority')}
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="Définir la priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Basse</SelectItem>
              <SelectItem value="MEDIUM">Moyenne</SelectItem>
              <SelectItem value="HIGH">Haute</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="dueDate">Date d'échéance</Label>
          {/* 🟢 MODIFICATION : L'Input utilise la fonction register */}
          <Input id="dueDate" type="date" {...form.register('dueDate')} />
        </div>

        {/* 🟢 MODIFICATION : Le bouton est désactivé pendant la soumission */}
        <Button
          type="submit"
          className="mt-2"
          disabled={isMutating || isPending}
        >
          {isMutating || isPending ? 'Ajout en cours...' : 'Ajouter la tâche'}
        </Button>
      </form>
    </SheetContent>
  );
}
