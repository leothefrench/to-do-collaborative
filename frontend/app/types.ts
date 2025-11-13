// app/types.ts

// --- Types de base ---

export enum State {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum PermissionLevel {
  READ_ONLY = 'READ_ONLY',
  EDIT = 'EDIT',
  ADMIN = 'ADMIN',
}

// --- Relations ---

// Utilisé pour le propriétaire et les collaborateurs
export interface SimpleUser {
  id: string;
  userName: string;
}

// Représente un enregistrement dans la table de jointure TaskListShare
export interface TaskListShare {
  userId: string;
  permissionLevel: PermissionLevel;
  user: SimpleUser; // Les détails du collaborateur
}

// --- Entités principales ---

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: State;
  dueDate: string | null;
  priority: Priority;
  taskListId: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskList {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner: SimpleUser;
  // Propriété actuellement utilisée par votre code dans SidebarButtons (corrigera l'erreur TS)
  sharedWith?: TaskListShare[];

  // Propriété que vous aviez précédemment définie (peut être renvoyée par d'autres API)
  sharedWithUsers?: TaskListShare[];

  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}