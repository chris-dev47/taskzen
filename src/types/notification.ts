export interface Notification {
  id: string;
  type: 'reminder' | 'overdue' | 'dueToday' | 'info';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  taskId?: string;
}
