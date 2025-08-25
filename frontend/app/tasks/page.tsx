'use client';

// Imports
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { PlusIcon, Trash2Icon, PencilIcon } from 'lucide-react';

// Interfaces pour la structure des données
interface Task {
  id: number;
  title: string;
  isCompleted: boolean;
}

// Données de tâche de démonstration
// Elles seront remplacées par des données réelles de la base de données plus tard.
const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Créer le composant de la liste de tâches',
    isCompleted: true,
  },
  {
    id: 2,
    title: 'Ajouter la fonctionnalité de création de tâche',
    isCompleted: false,
  },
  {
    id: 3,
    title: 'Configurer l\'authentification JWT',
    isCompleted: false,
  },
  {
    id: 4,
    title: 'Créer un système de gestion des utilisateurs',
    isCompleted: false,
  },
];

export default function TasksComponent() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  // Fonction pour ajouter une nouvelle tâche
  const handleAddTask = () => {
    if (newTaskTitle.trim() === '') return;
    const newTask = {
      id: tasks.length + 1,
      title: newTaskTitle,
      isCompleted: false,
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  // Fonction pour gérer le basculement de l'état d'une tâche (terminée/non terminée)
  const handleToggleCompletion = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  // Fonction pour supprimer une tâche
  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // Fonction pour activer le mode d'édition
  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  // Fonction pour sauvegarder les modifications
  const handleSaveEdit = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, title: editingTaskTitle } : task
      )
    );
    setEditingTaskId(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <Card className="w-full max-w-xl shadow-lg border border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">
            Tâches du jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Input
              type="text"
              placeholder="Ajouter une nouvelle tâche..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTask();
                }
              }}
              className="flex-grow rounded-full pl-5 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              size="icon"
              onClick={handleAddTask}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
            >
              <PlusIcon className="h-5 w-5" />
            </Button>
          </div>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-200 ${
                  task.isCompleted
                    ? 'bg-green-100 border-green-300'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3 flex-grow">
                  <Checkbox
                    checked={task.isCompleted}
                    onCheckedChange={() => handleToggleCompletion(task.id)}
                    className="h-5 w-5 rounded-full border-2"
                  />
                  {editingTaskId === task.id ? (
                    <Input
                      value={editingTaskTitle}
                      onChange={(e) => setEditingTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(task.id);
                        }
                      }}
                      onBlur={() => handleSaveEdit(task.id)}
                      autoFocus
                      className="flex-grow border-gray-300 focus:border-blue-500"
                    />
                  ) : (
                    <p
                      className={`text-lg font-medium ${
                        task.isCompleted
                          ? 'line-through text-gray-400'
                          : 'text-gray-900'
                      }`}
                    >
                      {task.title}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(task)}
                    className="text-gray-400 hover:text-blue-500 rounded-full"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-gray-400 hover:text-red-500 rounded-full"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
