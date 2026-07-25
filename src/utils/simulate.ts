import { storage } from './storage';

const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
const iso = (d: string) => new Date(d).toISOString();
const today = new Date().toISOString().split('T')[0];

const projectTasksKey = (pid: string) => `taskzen_project_${pid}_tasks`;

export const runSimulation = (userId: string) => {
  const store = storage.scoped(userId);
  const userName = store.get<{ name: string } | null>('currentUser', null)?.name || 'Moi';

  // Clean up any leftover global data from previous simulations
  const globalKeys = ['projects', 'members', 'milestones', 'activityLogs'];
  globalKeys.forEach((key) => localStorage.removeItem(`taskzen_${key}`));
  // Also remove legacy scoped data from old fake users
  ['u_alice', 'u_bob', 'u_clara', 'u_david', 'u_eva'].forEach((fakeId) => {
    ['tasks', 'tags', 'projects', 'members', 'milestones', 'activityLogs', 'gamification', 'notifications', 'darkMode', 'currentUser', 'isAuthenticated'].forEach((key) => {
      localStorage.removeItem(`taskzen_${fakeId}_${key}`);
    });
  });
  // Remove fake users from global users list, keep only current user
  const users = storage.get<any[]>('users', []);
  storage.set('users', users.filter((u) => u.id === userId));

  const tags = [
    { id: 's1', name: 'Urgent', color: '#ef4444' },
    { id: 's2', name: 'Important', color: '#f59e0b' },
    { id: 's3', name: 'Personnel', color: '#6366f1' },
    { id: 's4', name: 'Reunion', color: '#10b981' },
    { id: 's5', name: 'Projet', color: '#3b82f6' },
    { id: 's6', name: 'Design', color: '#ec4899' },
    { id: 's7', name: 'Bug', color: '#dc2626' },
  ];
  store.set('tags', tags);

  storage.set('members', [
    { id: 'm0', projectId: 'p1', userId, name: userName, email: '', avatar: '', role: 'admin', department: '', position: '', phone: '', joinedAt: iso('2026-07-01') },
    { id: 'm4', projectId: 'p2', userId, name: userName, email: '', avatar: '', role: 'admin', department: '', position: '', phone: '', joinedAt: iso('2026-06-01') },
  ]);

  storage.set('milestones', [
    { id: 'ms1', projectId: 'p1', title: 'Maquettes finalisees', description: 'Validation desktop + mobile', dueDate: '2026-08-01', completed: true, order: 0, createdAt: iso('2026-07-01') },
    { id: 'ms2', projectId: 'p1', title: 'Developpement termine', description: 'Toutes les pages developpees', dueDate: '2026-08-15', completed: false, order: 1, createdAt: iso('2026-07-01') },
    { id: 'ms3', projectId: 'p1', title: 'Tests et deploiement', description: 'QA + mise en prod', dueDate: '2026-08-25', completed: false, order: 2, createdAt: iso('2026-07-01') },
    { id: 'ms4', projectId: 'p2', title: 'Audit termine', description: 'Rapport finance valide', dueDate: '2026-07-15', completed: true, order: 0, createdAt: iso('2026-06-01') },
    { id: 'ms5', projectId: 'p2', title: "Plan d'action", description: 'Feuille de route Q3', dueDate: '2026-07-30', completed: false, order: 1, createdAt: iso('2026-06-01') },
  ]);

  storage.set('projects', [
    { id: 'p1', name: 'Refonte Site Web', description: 'Refonte complete du site vitrine avec nouveau design responsive.', status: 'active', color: '#3b82f6', icon: '🚀', startDate: '2026-07-01', endDate: '2026-08-30', budget: 15000, memberIds: ['m0'], taskIds: ['t1', 't2', 't3', 't4', 't5'], milestoneIds: ['ms1', 'ms2', 'ms3'], ownerId: userId, createdAt: iso('2026-07-01'), updatedAt: iso('2026-07-23'), deletedAt: null },
    { id: 'p2', name: 'Audit Interne Q3', description: 'Audit organisationnel et financier du S1.', status: 'active', color: '#f59e0b', icon: '📊', startDate: '2026-06-01', endDate: '2026-07-31', budget: 5000, memberIds: ['m4'], taskIds: ['t6', 't7', 't8'], milestoneIds: ['ms4', 'ms5'], ownerId: userId, createdAt: iso('2026-06-01'), updatedAt: iso('2026-07-20'), deletedAt: null },
  ]);

  // Project tasks in GLOBAL storage (accessible to all members)
  storage.set(projectTasksKey('p1'), [
    { id: 't1', title: 'Creer les maquettes Figma', description: 'Designer desktop et mobile.', status: 'done', priority: 'high', category: 'work', dueDate: '2026-07-15', projectId: 'p1', tags: ['s5', 's6'], attachments: [], reminders: [], subtasks: [{ id: id(), title: 'Maquette desktop', completed: true, priority: 'high', timeEstimate: 120, timeSpent: 100 }, { id: id(), title: 'Maquette mobile', completed: true, priority: 'high', timeEstimate: 90, timeSpent: 85 }], recurrence: 'none', archived: false, completedAt: iso('2026-07-14'), deletedAt: null, order: 0, createdAt: iso('2026-07-01'), updatedAt: iso('2026-07-14') },
    { id: 't2', title: "Integrer la page d'accueil", description: 'Header, hero, features, footer.', status: 'in-progress', priority: 'high', category: 'work', dueDate: '2026-07-25', projectId: 'p1', tags: ['s5'], attachments: [], reminders: [], subtasks: [{ id: id(), title: 'Header + Nav', completed: true, priority: 'medium', timeEstimate: 60, timeSpent: 55 }, { id: id(), title: 'Hero section', completed: true, priority: 'medium', timeEstimate: 45, timeSpent: 50 }, { id: id(), title: 'Features grid', completed: false, priority: 'medium', timeEstimate: 60, timeSpent: 20 }, { id: id(), title: 'Footer', completed: false, priority: 'low', timeEstimate: 30, timeSpent: 0 }], recurrence: 'none', archived: false, completedAt: null, deletedAt: null, order: 1, createdAt: iso('2026-07-10'), updatedAt: iso('2026-07-23') },
    { id: 't3', title: 'Configurer le SEO', description: 'Meta tags, sitemap, robots.txt.', status: 'todo', priority: 'medium', category: 'work', dueDate: '2026-08-10', projectId: 'p1', tags: ['s5', 's2'], attachments: [], reminders: [], subtasks: [], recurrence: 'none', archived: false, completedAt: null, deletedAt: null, order: 2, createdAt: iso('2026-07-10'), updatedAt: iso('2026-07-10') },
    { id: 't4', title: 'Bug responsive tablette', description: 'Images debordent sur 768px.', status: 'todo', priority: 'high', category: 'work', dueDate: today, projectId: 'p1', tags: ['s5', 's7'], attachments: [], reminders: [], subtasks: [], recurrence: 'none', archived: false, completedAt: null, deletedAt: null, order: 3, createdAt: iso('2026-07-20'), updatedAt: iso('2026-07-20') },
    { id: 't5', title: 'Reunion de suivi', description: 'Point hebdo equipe.', status: 'done', priority: 'low', category: 'work', dueDate: '2026-07-18', projectId: 'p1', tags: ['s4', 's5'], attachments: [], reminders: [], subtasks: [], recurrence: 'weekly', archived: false, completedAt: iso('2026-07-18'), deletedAt: null, order: 4, createdAt: iso('2026-07-01'), updatedAt: iso('2026-07-18') },
  ]);

  storage.set(projectTasksKey('p2'), [
    { id: 't6', title: 'Rassembler les bilans financiers', description: 'Consolider Q1 et Q2.', status: 'done', priority: 'high', category: 'finance', dueDate: '2026-07-05', projectId: 'p2', tags: ['s1', 's2'], attachments: [], reminders: [], subtasks: [{ id: id(), title: 'Bilan Q1', completed: true, priority: 'high', timeEstimate: 180, timeSpent: 200 }, { id: id(), title: 'Bilan Q2', completed: true, priority: 'high', timeEstimate: 180, timeSpent: 160 }], recurrence: 'none', archived: false, completedAt: iso('2026-07-05'), deletedAt: null, order: 5, createdAt: iso('2026-06-15'), updatedAt: iso('2026-07-05') },
    { id: 't7', title: 'Interview les managers', description: '5 entretiens departement.', status: 'in-progress', priority: 'medium', category: 'work', dueDate: '2026-07-20', projectId: 'p2', tags: ['s4'], attachments: [], reminders: [], subtasks: [{ id: id(), title: 'Mgr Production', completed: true, priority: 'medium', timeEstimate: 45, timeSpent: 50 }, { id: id(), title: 'Mgr Commercial', completed: true, priority: 'medium', timeEstimate: 45, timeSpent: 40 }, { id: id(), title: 'Mgr RH', completed: false, priority: 'medium', timeEstimate: 45, timeSpent: 0 }, { id: id(), title: 'Mgr IT', completed: false, priority: 'medium', timeEstimate: 45, timeSpent: 0 }], recurrence: 'none', archived: false, completedAt: null, deletedAt: null, order: 6, createdAt: iso('2026-07-01'), updatedAt: iso('2026-07-23') },
    { id: 't8', title: 'Rediger le rapport final', description: 'Synthese et recommandations.', status: 'todo', priority: 'high', category: 'work', dueDate: '2026-07-28', projectId: 'p2', tags: ['s2'], attachments: [], reminders: [], subtasks: [], recurrence: 'none', archived: false, completedAt: null, deletedAt: null, order: 7, createdAt: iso('2026-07-10'), updatedAt: iso('2026-07-10') },
  ]);

  // Personal tasks in user's scoped storage
  store.set('tasks', [
    { id: 't11', title: 'Rendez-vous medecin', description: 'Check-up annuel.', status: 'done', priority: 'medium', category: 'health', dueDate: '2026-07-10', projectId: '', tags: ['s3'], attachments: [], reminders: [], subtasks: [], recurrence: 'none', archived: false, completedAt: iso('2026-07-10'), deletedAt: null, order: 10, createdAt: iso('2026-07-01'), updatedAt: iso('2026-07-10') },
    { id: 't12', title: 'Livre Atomic Habits', description: 'Terminer la lecture.', status: 'in-progress', priority: 'low', category: 'education', dueDate: '2026-08-01', projectId: '', tags: ['s3'], attachments: [], reminders: [], subtasks: [{ id: id(), title: 'Chap. 1-5', completed: true, priority: 'low', timeEstimate: 60, timeSpent: 70 }, { id: id(), title: 'Chap. 6-10', completed: true, priority: 'low', timeEstimate: 60, timeSpent: 55 }, { id: id(), title: 'Chap. 11-17', completed: false, priority: 'low', timeEstimate: 60, timeSpent: 20 }], recurrence: 'none', archived: false, completedAt: null, deletedAt: null, order: 11, createdAt: iso('2026-06-15'), updatedAt: iso('2026-07-23') },
    { id: 't13', title: 'Budget vacances', description: 'Estimer le budget aout.', status: 'todo', priority: 'medium', category: 'finance', dueDate: '2026-07-30', projectId: '', tags: ['s3', 's2'], attachments: [], reminders: [], subtasks: [], recurrence: 'none', archived: false, completedAt: null, deletedAt: null, order: 12, createdAt: iso('2026-07-05'), updatedAt: iso('2026-07-05') },
    { id: 't14', title: 'Organiser soiree vendredi', description: 'Preparer la soiree.', status: 'todo', priority: 'low', category: 'personal', dueDate: '2026-07-25', projectId: '', tags: ['s3'], attachments: [], reminders: [{ id: id(), date: '2026-07-24', time: '18:00', message: 'Acheter les courses', triggered: false }], subtasks: [{ id: id(), title: 'Invitations', completed: true, priority: 'low', timeEstimate: 10, timeSpent: 5 }, { id: id(), title: 'Boissons', completed: false, priority: 'medium', timeEstimate: 30, timeSpent: 0 }], recurrence: 'none', archived: false, completedAt: null, deletedAt: null, order: 13, createdAt: iso('2026-07-15'), updatedAt: iso('2026-07-23') },
    { id: 't15', title: 'Appeler maman', description: 'Bon anniversaire.', status: 'done', priority: 'high', category: 'personal', dueDate: '2026-07-20', projectId: '', tags: ['s3', 's1'], attachments: [], reminders: [], subtasks: [], recurrence: 'none', archived: false, completedAt: iso('2026-07-20'), deletedAt: null, order: 14, createdAt: iso('2026-07-10'), updatedAt: iso('2026-07-20') },
  ]);

  store.set('gamification', {
    xp: 185, level: 3,
    badges: ['first_task', 'ten_tasks', 'streak_3', 'fifty_xp', 'early_bird'],
    streak: 4, lastCompletionDate: today, tasksCompletedToday: 2, weeklyGoal: 10,
  });

  store.set('notifications', [
    { id: id(), type: 'reminder', title: 'Rappel: Integrer la page', message: "Verifier l'integration", read: false, createdAt: iso('2026-07-23'), taskId: 't2' },
    { id: id(), type: 'dueToday', title: 'Echeance: Bug responsive', message: "Bug a corriger aujourd'hui", read: false, createdAt: iso('2026-07-23'), taskId: 't4' },
    { id: id(), type: 'info', title: 'Bienvenue !', message: 'Commencez a creer des taches.', read: true, createdAt: iso('2026-07-01') },
  ]);

  storage.set('activityLogs', [
    { id: id(), projectId: 'p1', memberId: 'm0', memberName: userName, action: 'created', details: 'Projet "Refonte Site Web" cree', createdAt: iso('2026-07-01') },
    { id: id(), projectId: 'p2', memberId: 'm4', memberName: userName, action: 'created', details: 'Projet "Audit Interne Q3" cree', createdAt: iso('2026-06-01') },
  ]);
};