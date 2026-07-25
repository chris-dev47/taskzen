import { useState, useCallback, useEffect } from 'react';
import { GamificationState, Task } from '../types/task';
import { storage } from '../utils/storage';

const XP_PER_TASK = { low: 10, medium: 25, high: 50 };
const XP_BONUS_STREAK = 10;
const XP_BONUS_SUBTASK = 5;

const BADGES = {
  first_task: { name: 'Premier pas', icon: '🌟', description: 'Creez votre premiere tache' },
  ten_tasks: { name: 'Productif', icon: '💪', description: 'Terminez 10 taches' },
  streak_3: { name: 'En forme', icon: '🔥', description: '3 jours consecutifs' },
  streak_7: { name: 'Imparable', icon: '⚡', description: '7 jours consecutifs' },
  all_done: { name: 'Clean desk', icon: '🏆', description: 'Toutes les taches terminees' },
  early_bird: { name: 'Matinal', icon: '🐦', description: 'Terminez une tache avant 9h' },
  night_owl: { name: 'Noctambule', icon: '🦉', description: 'Terminez une tache apres 22h' },
  fifty_xp: { name: 'Debutant', icon: '🎓', description: 'Gagnez 50 XP' },
  two_hundred_xp: { name: 'Confirme', icon: '⭐', description: 'Gagnez 200 XP' },
  five_hundred_xp: { name: 'Maitre', icon: '👑', description: 'Gagnez 500 XP' },
  focus_master: { name: 'Zen', icon: '🧘', description: 'Utilisez le mode Focus 5 fois' },
  subtasker: { name: 'Detaille', icon: '🧩', description: 'Completez 20 sous-taches' },
};

const getLevel = (xp: number): number => Math.floor(Math.sqrt(xp / 50)) + 1;
const getXPForLevel = (level: number): number => ((level - 1) ** 2) * 50;
const getLevelProgress = (xp: number): number => {
  const level = getLevel(xp);
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  return Math.round(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
};

const DEFAULT_GAMIFICATION: GamificationState = {
  xp: 0, level: 1, badges: [], streak: 0, lastCompletionDate: null, tasksCompletedToday: 0, weeklyGoal: 10,
};

export const useGamification = (userId?: string) => {
  const store = userId ? storage.scoped(userId) : storage.nullStore;

  const [state, setState] = useState<GamificationState>(() =>
    store.get<GamificationState>('gamification', DEFAULT_GAMIFICATION)
  );

  useEffect(() => {
    if (!userId) { setState(DEFAULT_GAMIFICATION); return; }
    const s = storage.scoped(userId);
    setState(s.get<GamificationState>('gamification', DEFAULT_GAMIFICATION));
  }, [userId]);

  useEffect(() => {
    if (userId) store.set('gamification', state);
  }, [state, store, userId]);

  const checkStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    setState((prev) => {
      if (prev.lastCompletionDate === today) return prev;
      if (prev.lastCompletionDate === yesterday) {
        return { ...prev, streak: prev.streak + 1, lastCompletionDate: today, tasksCompletedToday: 1 };
      }
      return { ...prev, streak: 1, lastCompletionDate: today, tasksCompletedToday: 1 };
    });
  }, []);

  const awardXP = useCallback((priority: 'low' | 'medium' | 'high') => {
    const baseXP = XP_PER_TASK[priority] || 25;
    setState((prev) => {
      const newXP = prev.xp + baseXP;
      const newLevel = getLevel(newXP);
      return { ...prev, xp: newXP, level: newLevel };
    });
  }, []);

  const awardSubtaskXP = useCallback(() => {
    setState((prev) => ({ ...prev, xp: prev.xp + XP_BONUS_SUBTASK }));
  }, []);

  const checkBadges = useCallback((tasks: Task[]) => {
    const newBadges: string[] = [];
    const activeTasks = tasks.filter((t) => !t.archived);
    const doneTasks = activeTasks.filter((t) => t.status === 'done');
    const now = new Date();

    if (tasks.length >= 1 && !state.badges.includes('first_task')) newBadges.push('first_task');
    if (doneTasks.length >= 10 && !state.badges.includes('ten_tasks')) newBadges.push('ten_tasks');
    if (state.streak >= 3 && !state.badges.includes('streak_3')) newBadges.push('streak_3');
    if (state.streak >= 7 && !state.badges.includes('streak_7')) newBadges.push('streak_7');
    if (doneTasks.length > 0 && activeTasks.every((t) => t.status === 'done') && !state.badges.includes('all_done')) newBadges.push('all_done');
    if (doneTasks.some((t) => t.completedAt && new Date(t.completedAt).getHours() < 9) && !state.badges.includes('early_bird')) newBadges.push('early_bird');
    if (doneTasks.some((t) => t.completedAt && new Date(t.completedAt).getHours() >= 22) && !state.badges.includes('night_owl')) newBadges.push('night_owl');
    if (state.xp >= 50 && !state.badges.includes('fifty_xp')) newBadges.push('fifty_xp');
    if (state.xp >= 200 && !state.badges.includes('two_hundred_xp')) newBadges.push('two_hundred_xp');
    if (state.xp >= 500 && !state.badges.includes('five_hundred_xp')) newBadges.push('five_hundred_xp');

    const totalCompletedSubtasks = activeTasks.reduce((acc, t) => acc + t.subtasks.filter((s) => s.completed).length, 0);
    if (totalCompletedSubtasks >= 20 && !state.badges.includes('subtasker')) newBadges.push('subtasker');

    if (newBadges.length > 0) {
      setState((prev) => ({ ...prev, badges: [...prev.badges, ...newBadges] }));
    }
    return newBadges;
  }, [state]);

  const setWeeklyGoal = useCallback((goal: number) => {
    setState((prev) => ({ ...prev, weeklyGoal: goal }));
  }, []);

  const resetGamification = useCallback(() => {
    setState({ xp: 0, level: 1, badges: [], streak: 0, lastCompletionDate: null, tasksCompletedToday: 0, weeklyGoal: 10 });
  }, []);

  return {
    ...state,
    BADGES,
    getLevel,
    getXPForLevel,
    getLevelProgress,
    checkStreak,
    awardXP,
    awardSubtaskXP,
    checkBadges,
    setWeeklyGoal,
    resetGamification,
  };
};
