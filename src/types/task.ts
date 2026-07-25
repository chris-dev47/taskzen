export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'personal' | 'work' | 'health' | 'finance' | 'education' | 'other';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  date: string;
  time: string;
  message: string;
  triggered: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  timeEstimate: number;
  timeSpent: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string;
  projectId?: string;
  tags: string[];
  attachments: Attachment[];
  reminders: Reminder[];
  subtasks: Subtask[];
  recurrence: Recurrence;
  archived: boolean;
  completedAt: string | null;
  deletedAt: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  category: TaskCategory | 'all';
  tags: string[];
  search: string;
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title' | 'order';
  sortOrder: 'asc' | 'desc';
  dateFrom: string;
  dateTo: string;
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'attachments' | 'subtasks' | 'archived' | 'completedAt'>;

export interface GamificationState {
  xp: number;
  level: number;
  badges: string[];
  streak: number;
  lastCompletionDate: string | null;
  tasksCompletedToday: number;
  weeklyGoal: number;
}

export interface ProductivityData {
  date: string;
  created: number;
  completed: number;
}
