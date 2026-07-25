import { useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';

export const useDarkMode = (userId?: string) => {
  const store = userId ? storage.scoped(userId) : storage.nullStore;

  const [isDark, setIsDark] = useState<boolean>(() => store.get<boolean>('darkMode', false));

  useEffect(() => {
    if (!userId) { setIsDark(false); document.documentElement.setAttribute('data-theme', 'light'); return; }
    const s = storage.scoped(userId);
    const val = s.get<boolean>('darkMode', false);
    setIsDark(val);
    document.documentElement.setAttribute('data-theme', val ? 'dark' : 'light');
  }, [userId]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (userId) store.set('darkMode', isDark);
  }, [isDark, store, userId]);

  const toggle = useCallback(() => setIsDark((prev) => !prev), []);

  return { isDark, toggle };
};
