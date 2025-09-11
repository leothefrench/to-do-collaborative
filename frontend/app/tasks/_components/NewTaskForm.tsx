// src/app/tasks/_components/NewTaskForm.tsx

'use client';

// 🟢 On garde seulement les imports nécessaires pour les composants de l'UI.
// Les imports de 'react-hook-form' et 'zod' ne sont plus nécessaires
// pour la soumission du formulaire, on peut les supprimer.
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

// 🟢 On importe la Server Action que nous avons créée.
import { createTask } from '@/actions/taskActions';

// Définitions de types
type State = 'TODO' | 'IN_PROGRESS' | 'DONE';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

type TaskList = {
  id: string;
  name: string;
};

// 🟢 La signature du composant change pour recevoir le 'token' en tant que prop.
type NewTaskFormProps = {
  taskLists: TaskList[];
  token: string;
};

export default function NewTaskForm({ taskLists, token }: NewTaskFormProps) {
  // 🟢 On supprime toute la logique de 'react-hook-form' (useForm, onSubmit, etc.).
  // C'est maintenant la Server Action qui gère la soumission.

  return (
    <SheetContent side="right" className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Créer une nouvelle tâche</SheetTitle>
      </SheetHeader>

      {/* 🟢 Le formulaire utilise l'attribut 'action' pour appeler la Server Action. */}
      {/* Cela remplace le `onSubmit={form.handleSubmit(onSubmit)}` précédent. */}
      <form
        action={(formData) => createTask(formData, token)}
        className="flex flex-col gap-4 mt-4"
        aria-label="Formulaire de création de tâche"
      >
        {/* Champ de sélection de la liste de tâches */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="taskList">Liste</Label>
          {/* 🟢 Ajout de l'attribut 'name' pour que le FormData puisse le récupérer. */}
          <Select name="taskListId">
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
          {/* 🟢 On peut supprimer les messages d'erreur de 'react-hook-form'. */}
        </div>

        {/* Champ pour le titre */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Titre</Label>
          {/* 🟢 Remplacement de `...form.register('title')` par l'attribut 'name'. */}
          <Input
            id="title"
            placeholder="Entrez un titre"
            name="title"
            required
          />
          {/* 🟢 On peut supprimer les messages d'erreur. */}
        </div>

        {/* Champ pour la description */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          {/* 🟢 Remplacement de `...form.register('description')` par l'attribut 'name'. */}
          <Textarea
            id="description"
            placeholder="Détails de la tâche"
            name="description"
          />
        </div>

        {/* Champ pour le statut */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Statut</Label>
          {/* 🟢 Remplacement de 'onValueChange' par 'name' et ajout d'une 'defaultValue'. */}
          {/* 🟢 Les valeurs de 'SelectItem' sont en majuscules pour correspondre à votre ENUM Prisma. */}
          <Select name="status" defaultValue="TODO">
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

        {/* Champ pour la priorité */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="priority">Priorité</Label>
          {/* 🟢 Remplacement de 'onValueChange' par 'name' et ajout d'une 'defaultValue'. */}
          {/* 🟢 Les valeurs de 'SelectItem' sont en majuscules pour correspondre à votre ENUM Prisma. */}
          <Select name="priority" defaultValue="MEDIUM">
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

        {/* Champ pour la date d'échéance */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="dueDate">Date d'échéance</Label>
          {/* 🟢 Remplacement de `...form.register('dueDate')` par l'attribut 'name'. */}
          <Input id="dueDate" type="date" name="dueDate" />
          {/* 🟢 On peut supprimer les messages d'erreur. */}
        </div>

        <Button type="submit" className="mt-2">
          Ajouter la tâche
        </Button>
      </form>
    </SheetContent>
  );
}
