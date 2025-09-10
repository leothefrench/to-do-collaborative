// src/app/tasks/_components/NewTaskForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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

// Définitions de types pour le statut et la priorité, en accord avec votre modèle Prisma.
type State = 'todo' | 'in_progress' | 'done';
type Priority = 'low' | 'medium' | 'high';

// Définition de la structure des données pour les listes de tâches.
type TaskList = {
  id: string;
  name: string;
};

// Schéma de validation Zod mis à jour avec les champs supplémentaires.
const taskSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  taskListId: z.string().min(1, 'Veuillez sélectionner une liste'),
});

type TaskFormValues = z.infer<typeof taskSchema>;

// Le composant reçoit maintenant les listes de tâches en tant que props.
export default function NewTaskForm({ taskLists }: { taskLists: TaskList[] }) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      dueDate: '',
      priority: 'medium',
      taskListId: '',
    },
  });

  const onSubmit = (data: TaskFormValues) => {
    // Ici, vous aurez l'ID de la liste de tâches sélectionnée, prêt à être envoyé à votre API.
    console.log('📌 Nouvelle tâche :', data);
    form.reset();
  };

  return (
    <SheetContent side="right" className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Créer une nouvelle tâche</SheetTitle>
      </SheetHeader>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 mt-4"
        aria-label="Formulaire de création de tâche"
      >
        {/* Champ de sélection de la liste de tâches */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="taskList">Liste</Label>
          <Select onValueChange={(value) => form.setValue('taskListId', value)}>
            <SelectTrigger id="taskList">
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

        {/* Champ pour le titre */}
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

        {/* Champ pour la description */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Détails de la tâche"
            {...form.register('description')}
          />
        </div>

        {/* Champ pour le statut */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Statut</Label>
          <Select
            onValueChange={(value: State) => form.setValue('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">À faire</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="done">Terminé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Champ pour la priorité */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="priority">Priorité</Label>
          <Select
            onValueChange={(value: Priority) =>
              form.setValue('priority', value)
            }
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="Définir la priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Basse</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="high">Haute</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Champ pour la date d'échéance */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="dueDate">Date d'échéance</Label>
          <Input id="dueDate" type="date" {...form.register('dueDate')} />
          {form.formState.errors.dueDate && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.dueDate.message}
            </p>
          )}
        </div>

        <Button type="submit" className="mt-2">
          Ajouter la tâche
        </Button>
      </form>
    </SheetContent>
  );
}
