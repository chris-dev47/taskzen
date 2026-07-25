import { useState, useCallback, useEffect, useRef } from 'react';
import { Notification } from '../types/notification';
import { Task } from '../types/task';
import { storage } from '../utils/storage';

export const useNotifications = (tasks: Task[], userId?: string) => {
  const store = userId ? storage.scoped(userId) : storage.nullStore;

  const [notifications, setNotifications] = useState<Notification[]>(() =>
    store.get<Notification[]>('notifications', [])
  );
  const [showPanel, setShowPanel] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!userId) { setNotifications([]); return; }
    const s = storage.scoped(userId);
    setNotifications(s.get<Notification[]>('notifications', []));
  }, [userId]);

  useEffect(() => {
    if (userId) store.set('notifications', notifications);
  }, [notifications, store, userId]);

  const checkReminders = useCallback(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDate = now.toISOString().split('T')[0];

    tasks.forEach((task) => {
      if (task.status === 'done') return;
      task.reminders.forEach((reminder) => {
        if (reminder.triggered) return;
        if (reminder.date === currentDate && reminder.time <= currentTime) {
          addNotification({
            type: 'reminder',
            title: `Rappel: ${task.title}`,
            message: reminder.message || `Rappel pour "${task.title}"`,
            taskId: task.id,
          });
          store.set(
            `reminder_${reminder.id}`,
            true
          );
        }
      });

      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const today = new Date(new Date().toDateString());
        if (dueDate.toDateString() === today.toDateString()) {
          const existingToday = notifications.find(
            (n) => n.taskId === task.id && n.type === 'dueToday' && !n.read
          );
          if (!existingToday) {
            addNotification({
              type: 'dueToday',
              title: `Echeance aujourd'hui: ${task.title}`,
              message: 'Cette tache est due aujourd\'hui',
              taskId: task.id,
            });
          }
        }
      }
    });
  }, [tasks, notifications]);

  useEffect(() => {
    checkReminders();
    intervalRef.current = setInterval(checkReminders, 60000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkReminders]);

  const addNotification = useCallback(
    (data: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
      const newNotif: Notification = {
        ...data,
        id: storage.generateId(),
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev].slice(0, 50));
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    showPanel,
    setShowPanel,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
};
