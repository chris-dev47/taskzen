import { useState, useCallback, useEffect, useMemo } from 'react';
import { Task, TaskFormData, TaskFilters, Tag, Attachment, Reminder, Recurrence, TaskStatus } from '../types/task';
import { storage } from '../utils/storage';
import { sortTasks, filterTasks, autoDetectTags } from '../utils/helpers';

const DEFAULT_FILTERS: TaskFilters = {
  status: 'all', priority: 'all', category: 'all', tags: [], search: '',
  sortBy: 'order', sortOrder: 'asc', dateFrom: '', dateTo: '',
};

const DEFAULT_TAGS: Tag[] = [
  { id: 'tag1', name: 'Urgent', color: '#ef4444' },
  { id: 'tag2', name: 'Important', color: '#f59e0b' },
  { id: 'tag3', name: 'Personnel', color: '#6366f1' },
  { id: 'tag4', name: 'Reunion', color: '#10b981' },
  { id: 'tag5', name: 'Projet', color: '#3b82f6' },
  { id: 'tag6', name: 'A ideer', color: '#8b5cf6' },
];

const getNextDueDate = (currentDueDate: string, recurrence: Recurrence): string => {
  const date = new Date(currentDueDate);
  switch (recurrence) {
    case 'daily': date.setDate(date.getDate() + 1); break;
    case 'weekly': date.setDate(date.getDate() + 7); break;
    case 'monthly': date.setMonth(date.getMonth() + 1); break;
    case 'yearly': date.setFullYear(date.getFullYear() + 1); break;
    default: return '';
  }
  return date.toISOString().split('T')[0];
};

const normalizeTask = (t: Task, i: number): Task => ({
  ...t,
  tags: t.tags || [],
  attachments: t.attachments || [],
  reminders: t.reminders || [],
  subtasks: (t.subtasks || []).map((s: any) => ({
    ...s, priority: s.priority || 'medium', timeEstimate: s.timeEstimate || 0, timeSpent: s.timeSpent || 0,
  })),
  recurrence: t.recurrence || 'none',
  archived: t.archived || false,
  completedAt: t.completedAt || null,
  order: t.order ?? i,
});

const projectTasksKey = (projectId: string) => `project_${projectId}_tasks`;

export const useTasks = (userId?: string, projectIds?: string[]) => {
  const userStore = userId ? storage.scoped(userId) : storage.nullStore;

  const [personalTasks, setPersonalTasks] = useState<Task[]>(() =>
    userStore.get<Task[]>('tasks', []).map(normalizeTask)
  );
  const [tags, setTags] = useState<Tag[]>(() => userStore.get<Tag[]>('tags', DEFAULT_TAGS));
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);

  const [projectTasksMap, setProjectTasksMap] = useState<Record<string, Task[]>>({});

  useEffect(() => {
    if (!userId) { setPersonalTasks([]); setTags(DEFAULT_TAGS); return; }
    const s = storage.scoped(userId);
    setPersonalTasks(s.get<Task[]>('tasks', []).map(normalizeTask));
    setTags(s.get<Tag[]>('tags', DEFAULT_TAGS));
  }, [userId, projectIds]);

  useEffect(() => { if (userId) userStore.set('tasks', personalTasks); }, [personalTasks, userStore, userId]);
  useEffect(() => { if (userId) userStore.set('tags', tags); }, [tags, userStore, userId]);

  useEffect(() => {
    if (!projectIds || projectIds.length === 0) { setProjectTasksMap({}); return; }
    const map: Record<string, Task[]> = {};
    projectIds.forEach((pid) => {
      const raw = storage.get<Task[]>(projectTasksKey(pid), []);
      map[pid] = raw.map(normalizeTask);
    });
    setProjectTasksMap(map);
  }, [projectIds]);

  useEffect(() => {
    Object.entries(projectTasksMap).forEach(([pid, pts]) => {
      storage.set(projectTasksKey(pid), pts);
    });
  }, [projectTasksMap]);

  const getStore = (projectId?: string) => projectId ? storage : userStore;
  const getTaskArray = (projectId?: string) => projectId ? projectTasksMap[projectId] || [] : personalTasks;
  const setTaskArray = (projectId?: string) => projectId
    ? (newTasks: Task[]) => setProjectTasksMap((prev) => ({ ...prev, [projectId]: newTasks }))
    : setPersonalTasks;

  const addTask = useCallback((data: TaskFormData) => {
    const now = new Date().toISOString();
    const projectId = data.projectId || undefined;
    const tasksArr = getTaskArray(projectId);
    const setTasksArr = setTaskArray(projectId);
    const maxOrder = tasksArr.reduce((max, t) => Math.max(max, t.order ?? 0), -1);
    const autoTags = autoDetectTags(data.title, data.description);
    const existingTagIds = tags.map((t) => t.id);
    const tagsToUse = [...new Set([...(data.tags || []), ...autoTags.filter((name) => {
      const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
      if (existing) return true;
      return false;
    }).map((name) => tags.find((t) => t.name.toLowerCase() === name.toLowerCase())?.id || '')])].filter((id) => id && existingTagIds.includes(id));

    const newTask: Task = {
      ...data,
      tags: tagsToUse.length > 0 ? tagsToUse : data.tags || [],
      id: storage.generateId(),
      attachments: [],
      subtasks: [],
      archived: false,
      completedAt: null,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    };
    setTasksArr([newTask, ...tasksArr]);
  }, [tags]);

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    setPersonalTasks((prev) => prev.map((task) => task.id === id ? { ...task, ...data, updatedAt: new Date().toISOString() } : task));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => {
        updated[pid] = arr.map((task) => task.id === id ? { ...task, ...data, updatedAt: new Date().toISOString() } : task);
      });
      return updated;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setPersonalTasks((prev) => prev.map((t) => t.id === id ? { ...t, deletedAt: new Date().toISOString() } : t));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => {
        updated[pid] = arr.map((t) => t.id === id ? { ...t, deletedAt: new Date().toISOString() } : t);
      });
      return updated;
    });
  }, []);

  const restoreFromTrash = useCallback((id: string) => {
    setPersonalTasks((prev) => prev.map((t) => t.id === id ? { ...t, deletedAt: null } : t));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => {
        updated[pid] = arr.map((t) => t.id === id ? { ...t, deletedAt: null } : t);
      });
      return updated;
    });
  }, []);

  const deletePermanently = useCallback((id: string) => {
    setPersonalTasks((prev) => prev.filter((t) => t.id !== id));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => {
        updated[pid] = arr.filter((t) => t.id !== id);
      });
      return updated;
    });
  }, []);

  const emptyTrash = useCallback(() => {
    setPersonalTasks((prev) => prev.filter((t) => !t.deletedAt));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => {
        updated[pid] = arr.filter((t) => !t.deletedAt);
      });
      return updated;
    });
  }, []);

  const toggleStatus = useCallback((id: string) => {
    const updateFn = (task: Task) => {
      if (task.id !== id) return task;
      const nextStatus = task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'done' : 'todo';
      const completedAt = nextStatus === 'done' ? new Date().toISOString() : null;
      let newDueDate = task.dueDate;
      if (nextStatus === 'done' && task.recurrence !== 'none' && task.dueDate) {
        newDueDate = getNextDueDate(task.dueDate, task.recurrence);
      }
      return { ...task, status: nextStatus as TaskStatus, completedAt, dueDate: newDueDate, updatedAt: new Date().toISOString() };
    };
    setPersonalTasks((prev) => prev.map(updateFn));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => { updated[pid] = arr.map(updateFn); });
      return updated;
    });
  }, []);

  const archiveTask = useCallback((id: string) => {
    const updateFn = (task: Task) => task.id === id ? { ...task, archived: true, updatedAt: new Date().toISOString() } : task;
    setPersonalTasks((prev) => prev.map(updateFn));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => { updated[pid] = arr.map(updateFn); });
      return updated;
    });
  }, []);

  const restoreTask = useCallback((id: string) => {
    const updateFn = (task: Task) => task.id === id ? { ...task, archived: false, updatedAt: new Date().toISOString() } : task;
    setPersonalTasks((prev) => prev.map(updateFn));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => { updated[pid] = arr.map(updateFn); });
      return updated;
    });
  }, []);

  const clearArchive = useCallback(() => {
    setPersonalTasks((prev) => prev.filter((t) => !t.archived));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => { updated[pid] = arr.filter((t) => !t.archived); });
      return updated;
    });
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    const updateFn = (task: Task) => task.id !== taskId ? task : {
      ...task, subtasks: task.subtasks.map((s) => s.id === subtaskId ? { ...s, completed: !s.completed } : s), updatedAt: new Date().toISOString(),
    };
    setPersonalTasks((prev) => prev.map(updateFn));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => { updated[pid] = arr.map(updateFn); });
      return updated;
    });
  }, []);

  const addSubtask = useCallback((taskId: string, title: string, priority: 'low' | 'medium' | 'high' = 'medium', timeEstimate: number = 0) => {
    const updateFn = (task: Task) => task.id !== taskId ? task : {
      ...task, subtasks: [...task.subtasks, { id: storage.generateId(), title, completed: false, priority, timeEstimate, timeSpent: 0 }], updatedAt: new Date().toISOString(),
    };
    setPersonalTasks((prev) => prev.map(updateFn));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => { updated[pid] = arr.map(updateFn); });
      return updated;
    });
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    const updateFn = (task: Task) => task.id !== taskId ? task : { ...task, subtasks: task.subtasks.filter((s) => s.id !== subtaskId), updatedAt: new Date().toISOString() };
    setPersonalTasks((prev) => prev.map(updateFn));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => { updated[pid] = arr.map(updateFn); });
      return updated;
    });
  }, []);

  const addTimeSpent = useCallback((taskId: string, subtaskId: string, minutes: number) => {
    const updateFn = (task: Task) => task.id !== taskId ? task : {
      ...task, subtasks: task.subtasks.map((s) => s.id === subtaskId ? { ...s, timeSpent: (s.timeSpent || 0) + minutes } : s), updatedAt: new Date().toISOString(),
    };
    setPersonalTasks((prev) => prev.map(updateFn));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => { updated[pid] = arr.map(updateFn); });
      return updated;
    });
  }, []);

  const addAttachment = useCallback(async (taskId: string, file: File) => {
    const dataUrl = await storage.fileToDataUrl(file);
    const attachment: Attachment = { id: storage.generateId(), name: file.name, type: file.type, size: file.size, dataUrl, createdAt: new Date().toISOString() };
    const updateFn = (task: Task) => task.id === taskId ? { ...task, attachments: [...task.attachments, attachment], updatedAt: new Date().toISOString() } : task;
    setPersonalTasks((prev) => prev.map(updateFn));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => { updated[pid] = arr.map(updateFn); });
      return updated;
    });
  }, []);

  const deleteAttachment = useCallback((taskId: string, attachmentId: string) => {
    const updateFn = (task: Task) => task.id === taskId ? { ...task, attachments: task.attachments.filter((a) => a.id !== attachmentId), updatedAt: new Date().toISOString() } : task;
    setPersonalTasks((prev) => prev.map(updateFn));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => { updated[pid] = arr.map(updateFn); });
      return updated;
    });
  }, []);

  const addReminder = useCallback((taskId: string, reminder: Omit<Reminder, 'id' | 'triggered'>) => {
    const updateFn = (task: Task) => task.id === taskId ? { ...task, reminders: [...task.reminders, { ...reminder, id: storage.generateId(), triggered: false }], updatedAt: new Date().toISOString() } : task;
    setPersonalTasks((prev) => prev.map(updateFn));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => { updated[pid] = arr.map(updateFn); });
      return updated;
    });
  }, []);

  const deleteReminder = useCallback((taskId: string, reminderId: string) => {
    const updateFn = (task: Task) => task.id === taskId ? { ...task, reminders: task.reminders.filter((r) => r.id !== reminderId), updatedAt: new Date().toISOString() } : task;
    setPersonalTasks((prev) => prev.map(updateFn));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => { updated[pid] = arr.map(updateFn); });
      return updated;
    });
  }, []);

  const reorderTasks = useCallback((dragIndex: number, hoverIndex: number) => {
    setPersonalTasks((prev) => {
      const filtered = filterTasks(prev.filter((t) => !t.archived), filters);
      const sorted = sortTasks(filtered, filters.sortBy, filters.sortOrder);
      const draggedTask = sorted[dragIndex];
      const targetTask = sorted[hoverIndex];
      if (!draggedTask || !targetTask) return prev;
      return prev.map((t) => {
        if (t.id === draggedTask.id) return { ...t, order: targetTask.order };
        if (dragIndex < hoverIndex) {
          if (t.order > draggedTask.order && t.order <= targetTask.order) return { ...t, order: t.order - 1 };
        } else {
          if (t.order >= targetTask.order && t.order < draggedTask.order) return { ...t, order: t.order + 1 };
        }
        return t;
      });
    });
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => {
        const filtered = filterTasks(arr.filter((t) => !t.archived), filters);
        const sorted = sortTasks(filtered, filters.sortBy, filters.sortOrder);
        const draggedTask = sorted[dragIndex];
        const targetTask = sorted[hoverIndex];
        if (!draggedTask || !targetTask) { updated[pid] = arr; return; }
        updated[pid] = arr.map((t) => {
          if (t.id === draggedTask.id) return { ...t, order: targetTask.order };
          if (dragIndex < hoverIndex) {
            if (t.order > draggedTask.order && t.order <= targetTask.order) return { ...t, order: t.order - 1 };
          } else {
            if (t.order >= targetTask.order && t.order < draggedTask.order) return { ...t, order: t.order + 1 };
          }
          return t;
        });
      });
      return updated;
    });
  }, [filters]);

  const addTag = useCallback((name: string, color: string) => {
    const newTag: Tag = { id: storage.generateId(), name, color };
    setTags((prev) => [...prev, newTag]);
    return newTag;
  }, []);

  const updateTag = useCallback((id: string, data: Partial<Tag>) => {
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }, []);

  const deleteTag = useCallback((id: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
    const updateFn = (task: Task) => ({ ...task, tags: task.tags.filter((t) => t !== id) });
    setPersonalTasks((prev) => prev.map(updateFn));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => { updated[pid] = arr.map(updateFn); });
      return updated;
    });
  }, []);

  const mergeTags = useCallback((sourceId: string, targetId: string) => {
    const updateFn = (task: Task) => {
      if (!task.tags.includes(sourceId)) return task;
      return { ...task, tags: [...task.tags.filter((t) => t !== sourceId), targetId] };
    };
    setPersonalTasks((prev) => prev.map(updateFn));
    setProjectTasksMap((prev) => {
      const updated: Record<string, Task[]> = {};
      Object.entries(prev).forEach(([pid, arr]) => { updated[pid] = arr.map(updateFn); });
      return updated;
    });
    setTags((prev) => prev.filter((t) => t.id !== sourceId));
  }, []);

  const allTasks = useMemo(() => [
    ...personalTasks,
    ...Object.values(projectTasksMap).flat(),
  ], [personalTasks, projectTasksMap]);

  const filteredTasks = filterTasks(allTasks.filter((t) => !t.archived && !t.deletedAt), filters);
  const sortedTasks = sortTasks(filteredTasks, filters.sortBy, filters.sortOrder);

  const updateFilters = useCallback((partial: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  return {
    tasks: sortedTasks,
    allTasks,
    filters,
    setFilters: updateFilters,
    tags,
    addTask, updateTask, deleteTask, toggleStatus,
    restoreFromTrash, deletePermanently, emptyTrash,
    archiveTask, restoreTask, clearArchive,
    toggleSubtask, addSubtask, deleteSubtask, addTimeSpent,
    addAttachment, deleteAttachment,
    addReminder, deleteReminder,
    reorderTasks, addTag, updateTag, deleteTag, mergeTags,
  };
};