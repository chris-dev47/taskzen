const PREFIX = 'taskzen';

const scoped = (userId: string) => ({
  get: <T>(key: string, fallback: T): T => {
    try {
      const data = localStorage.getItem(`${PREFIX}_${userId}_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },
  set: <T>(key: string, value: T): void => {
    localStorage.setItem(`${PREFIX}_${userId}_${key}`, JSON.stringify(value));
  },
  remove: (key: string): void => {
    localStorage.removeItem(`${PREFIX}_${userId}_${key}`);
  },
});

const nullStore = {
  get: <T>(_key: string, fallback: T): T => fallback,
  set: <T>(_key: string, _value: T): void => {},
  remove: (_key: string): void => {},
};

type Store = typeof scoped extends (userId: string) => infer R ? R : never;

export const storage = {
  get: <T>(key: string, fallback: T): T => {
    try {
      const data = localStorage.getItem(`${PREFIX}_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },

  set: <T>(key: string, value: T): void => {
    localStorage.setItem(`${PREFIX}_${key}`, JSON.stringify(value));
  },

  remove: (key: string): void => {
    localStorage.removeItem(`${PREFIX}_${key}`);
  },

  scoped,

  nullStore: nullStore as Store,

  generateId: (): string => {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  },

  fileToDataUrl: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};
