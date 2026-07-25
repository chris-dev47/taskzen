import { Task, TaskPriority, TaskCategory, Recurrence } from '../types/task';

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateRelative = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Demain';
  if (diffDays === -1) return 'Hier';
  if (diffDays > 1 && diffDays <= 7) return `Dans ${diffDays} jours`;
  if (diffDays < -1 && diffDays >= -7) return `Il y a ${Math.abs(diffDays)} jours`;
  return formatDate(dateString);
};

export const formatDateTime = (date: string, time: string): string => {
  if (!date) return '';
  return `${formatDateRelative(date)} ${time || ''}`.trim();
};

export const isOverdue = (dueDate: string): boolean => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
};

export const isDueToday = (dueDate: string): boolean => {
  if (!dueDate) return false;
  return new Date(dueDate).toDateString() === new Date().toDateString();
};

export const isDueTomorrow = (dueDate: string): boolean => {
  if (!dueDate) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return new Date(dueDate).toDateString() === tomorrow.toDateString();
};

export const isDueThisWeek = (dueDate: string): boolean => {
  if (!dueDate) return false;
  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
  const due = new Date(dueDate);
  return due >= now && due <= endOfWeek;
};

export const sortTasks = (tasks: Task[], sortBy: string, sortOrder: string): Task[] => {
  return [...tasks].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'priority':
        comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        break;
      case 'dueDate':
        comparison =
          new Date(a.dueDate || '9999-12-31').getTime() -
          new Date(b.dueDate || '9999-12-31').getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'order':
        comparison = a.order - b.order;
        break;
      case 'createdAt':
      default:
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

export const filterTasks = (
  tasks: Task[],
  filters: {
    status: string;
    priority: string;
    category: string;
    tags: string[];
    search: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Task[] => {
  return tasks.filter((task) => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.category !== 'all' && task.category !== filters.category) return false;
    if (filters.tags.length > 0 && !filters.tags.some((t) => task.tags.includes(t))) return false;
    if (filters.dateFrom && task.dueDate && task.dueDate < filters.dateFrom) return false;
    if (filters.dateTo && task.dueDate && task.dueDate > filters.dateTo) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });
};

export const getTaskStats = (tasks: Task[]) => {
  const active = tasks.filter((t) => !t.archived);
  const total = active.length;
  const todo = active.filter((t) => t.status === 'todo').length;
  const inProgress = active.filter((t) => t.status === 'in-progress').length;
  const done = active.filter((t) => t.status === 'done').length;
  const overdue = active.filter((t) => isOverdue(t.dueDate) && t.status !== 'done').length;
  const dueToday = active.filter((t) => isDueToday(t.dueDate) && t.status !== 'done').length;
  const dueTomorrow = active.filter((t) => isDueTomorrow(t.dueDate) && t.status !== 'done').length;
  const dueThisWeek = active.filter((t) => isDueThisWeek(t.dueDate) && t.status !== 'done').length;
  const totalSubtasks = active.reduce((acc, t) => acc + t.subtasks.length, 0);
  const completedSubtasks = active.reduce((acc, t) => acc + t.subtasks.filter((s) => s.completed).length, 0);
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
  const totalTimeEstimate = active.reduce((acc, t) => acc + t.subtasks.reduce((a, s) => a + (s.timeEstimate || 0), 0), 0);
  const totalTimeSpent = active.reduce((acc, t) => acc + t.subtasks.reduce((a, s) => a + (s.timeSpent || 0), 0), 0);

  return {
    total, todo, inProgress, done, overdue, dueToday, dueTomorrow, dueThisWeek,
    totalSubtasks, completedSubtasks, completionRate,
    totalTimeEstimate, totalTimeSpent,
  };
};

export const getWorkloadByDay = (tasks: Task[], days: number = 7): { date: string; label: string; count: number }[] => {
  const result: { date: string; label: string; count: number }[] = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const count = tasks.filter(
      (t) => t.dueDate === dateStr && t.status !== 'done' && !t.archived
    ).length;
    const label = i === 0 ? "Auj." : i === 1 ? 'Dem.' : d.toLocaleDateString('fr-FR', { weekday: 'short' });
    result.push({ date: dateStr, label, count });
  }
  return result;
};

export const getProductivityData = (tasks: Task[], days: number = 14): { date: string; created: number; completed: number }[] => {
  const result: { date: string; created: number; completed: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    const created = tasks.filter((t) => {
      const cr = new Date(t.createdAt);
      return cr >= dayStart && cr < dayEnd;
    }).length;
    const completed = tasks.filter((t) => {
      if (!t.completedAt) return false;
      const cr = new Date(t.completedAt);
      return cr >= dayStart && cr < dayEnd;
    }).length;
    result.push({ date: dateStr, created, completed });
  }
  return result;
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    personal: '#6366f1', work: '#f59e0b', health: '#10b981',
    finance: '#3b82f6', education: '#8b5cf6', other: '#6b7280',
  };
  return colors[category] || '#6b7280';
};

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    personal: 'Personnel', work: 'Travail', health: 'Sante',
    finance: 'Finance', education: 'Education', other: 'Autre',
  };
  return labels[category] || category;
};

export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    personal: '🏠', work: '💼', health: '💪',
    finance: '💰', education: '📚', other: '📌',
  };
  return icons[category] || '📌';
};

export const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = { high: 'Haute', medium: 'Moyenne', low: 'Basse' };
  return labels[priority] || priority;
};

export const getPriorityIcon = (priority: string): string => {
  const icons: Record<string, string> = { high: '🔴', medium: '🟠', low: '🟢' };
  return icons[priority] || '';
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = { todo: 'A faire', 'in-progress': 'En cours', done: 'Termine' };
  return labels[status] || status;
};

export const getRecurrenceLabel = (r: string): string => {
  const labels: Record<string, string> = {
    none: 'Aucune', daily: 'Quotidienne', weekly: 'Hebdomadaire',
    monthly: 'Mensuelle', yearly: 'Annuelle',
  };
  return labels[r] || r;
};

export const getRecurrenceIcon = (r: string): string => {
  const icons: Record<string, string> = {
    daily: '🔄', weekly: '📅', monthly: '📆', yearly: '🗓️',
  };
  return icons[r] || '';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

export const autoDetectTags = (title: string, description: string): string[] => {
  const text = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];
  if (text.includes('urgent') || text.includes('asap') || text.includes('critique')) tags.push('urgent');
  if (text.includes('important') || text.includes('priorite')) tags.push('important');
  if (text.includes('reunion') || text.includes('meeting')) tags.push('reunion');
  if (text.includes('appel') || text.includes('tel') || text.includes('电话')) tags.push('appel');
  if (text.includes('email') || text.includes('mail')) tags.push('email');
  if (text.includes('projet') || text.includes('project')) tags.push('projet');
  return tags;
};

export const formatPomodoroTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
