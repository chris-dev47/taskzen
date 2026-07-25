import { useState, useCallback, useEffect } from 'react';
import { User, AuthState } from '../types/user';
import { storage } from '../utils/storage';

interface StoredUser extends User {
  password: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const lastUserId = storage.get<string | null>('lastUserId', null);
    if (lastUserId) {
      const user = storage.scoped(lastUserId).get<User | null>('currentUser', null);
      const isAuth = storage.scoped(lastUserId).get<boolean>('isAuthenticated', false);
      if (user && isAuth) {
        return { user, isAuthenticated: true };
      }
    }
    return { user: null, isAuthenticated: false };
  });

  useEffect(() => {
    if (authState.user) {
      storage.set('lastUserId', authState.user.id);
    }
  }, [authState.user]);

  const register = useCallback(
    (email: string, name: string, password: string): { success: boolean; error?: string } => {
      const users = storage.get<StoredUser[]>('users', []);
      if (users.find((u) => u.email === email)) {
        return { success: false, error: 'Cet email est deja utilise' };
      }
      if (password.length < 6) {
        return { success: false, error: 'Le mot de passe doit faire au moins 6 caracteres' };
      }

      const newUser: StoredUser = {
        id: storage.generateId(),
        email,
        name,
        password,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1`,
        createdAt: new Date().toISOString(),
      };

      storage.set('users', [...users, newUser]);
      const { password: _, ...userWithoutPassword } = newUser;
      const scoped = storage.scoped(newUser.id);
      scoped.set('currentUser', userWithoutPassword);
      scoped.set('isAuthenticated', true);
      storage.set('lastUserId', newUser.id);
      setAuthState({ user: userWithoutPassword, isAuthenticated: true });
      return { success: true };
    },
    []
  );

  const login = useCallback(
    (email: string, password: string): { success: boolean; error?: string } => {
      const users = storage.get<StoredUser[]>('users', []);
      const user = users.find((u) => u.email === email && u.password === password);
      if (!user) {
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }
      const { password: _, ...userWithoutPassword } = user;
      const scoped = storage.scoped(user.id);
      scoped.set('currentUser', userWithoutPassword);
      scoped.set('isAuthenticated', true);
      storage.set('lastUserId', user.id);
      setAuthState({ user: userWithoutPassword, isAuthenticated: true });
      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    if (authState.user) {
      const scoped = storage.scoped(authState.user.id);
      scoped.remove('currentUser');
      scoped.set('isAuthenticated', false);
    }
    storage.remove('lastUserId');
    setAuthState({ user: null, isAuthenticated: false });
  }, [authState.user]);

  const updateProfile = useCallback(
    (data: Partial<Pick<User, 'name' | 'avatar'>>) => {
      if (!authState.user) return;
      const updated = { ...authState.user, ...data };
      if (data.name && !data.avatar) {
        updated.avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=6366f1`;
      }
      const scoped = storage.scoped(authState.user.id);
      scoped.set('currentUser', updated);
      setAuthState((prev) => ({ ...prev, user: updated }));

      const users = storage.get<StoredUser[]>('users', []);
      storage.set(
        'users',
        users.map((u) => (u.id === updated.id ? { ...u, ...data } : u))
      );
    },
    [authState.user]
  );

  const deleteAccount = useCallback(() => {
    if (!authState.user) return;
    const userId = authState.user.id;

    const users = storage.get<StoredUser[]>('users', []);
    storage.set('users', users.filter((u) => u.id !== userId));

    // Remove user from global members
    const members = storage.get<any[]>('members', []);
    storage.set('members', members.filter((m) => m.userId !== userId));

    // Delete projects owned by this user + their milestones & activity logs
    const projects = storage.get<any[]>('projects', []);
    const ownedIds = projects.filter((p) => p.ownerId === userId).map((p) => p.id);
    storage.set('projects', projects.filter((p) => p.ownerId !== userId));

    const milestones = storage.get<any[]>('milestones', []);
    storage.set('milestones', milestones.filter((m) => !ownedIds.includes(m.projectId)));

    const logs = storage.get<any[]>('activityLogs', []);
    storage.set('activityLogs', logs.filter((l) => !ownedIds.includes(l.projectId)));

    // Clear scoped data for this user
    const scopedKeys = ['tasks', 'tags', 'gamification', 'notifications', 'darkMode', 'currentUser', 'isAuthenticated'];
    scopedKeys.forEach((key) => localStorage.removeItem(`taskzen_${userId}_${key}`));

    storage.remove('lastUserId');
    setAuthState({ user: null, isAuthenticated: false });
  }, [authState.user]);

  const getAllUsers = useCallback((): User[] => {
    const users = storage.get<StoredUser[]>('users', []);
    return users.map(({ password: _, ...user }) => user);
  }, []);

  return { ...authState, login, register, logout, updateProfile, deleteAccount, getAllUsers };
};