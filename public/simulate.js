// ============================================
// SIMULATION TASKZEN — Copie-colle dans la console
// ============================================

(() => {
  const uid = JSON.parse(localStorage.getItem('taskzen_currentUser') || '{}').id;
  if (!uid) { alert('Connecte-toi d\'abord !'); return; }

  const k = (key) => `taskzen_${uid}_${key}`;
  const id = () => `${Date.now()}-${Math.random().toString(36).slice(2,11)}`;
  const today = new Date().toISOString().split('T')[0];
  const iso = (d) => new Date(d).toISOString();

  // === TAGS ===
  const tags = [
    { id: 'stag1', name: 'Urgent', color: '#ef4444' },
    { id: 'stag2', name: 'Important', color: '#f59e0b' },
    { id: 'stag3', name: 'Personnel', color: '#6366f1' },
    { id: 'stag4', name: 'Reunion', color: '#10b981' },
    { id: 'stag5', name: 'Projet', color: '#3b82f6' },
    { id: 'stag6', name: 'A ideer', color: '#8b5cf6' },
    { id: 'stag7', name: 'Bug', color: '#dc2626' },
    { id: 'stag8', name: 'Design', color: '#ec4899' },
  ];
  localStorage.setItem(k('tags'), JSON.stringify(tags));

  // === MEMBRES ===
  const members = [
    { id: 'm1', projectId: 'proj1', name: 'Alice Martin', email: 'alice@mail.com', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Alice&backgroundColor=6366f1', role: 'admin', department: 'Developpement', position: 'Lead Dev', phone: '06 12 34 56 78', joinedAt: iso('2026-06-01') },
    { id: 'm2', projectId: 'proj1', name: 'Bob Dupont', email: 'bob@mail.com', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Bob&backgroundColor=3b82f6', role: 'member', department: 'Design', position: 'UI/UX Designer', phone: '06 23 45 67 89', joinedAt: iso('2026-06-05') },
    { id: 'm3', projectId: 'proj1', name: 'Clara Ruiz', email: 'clara@mail.com', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Clara&backgroundColor=10b981', role: 'viewer', department: 'Marketing', position: 'Resp. Communication', phone: '06 34 56 78 90', joinedAt: iso('2026-06-10') },
    { id: 'm4', projectId: 'proj2', name: 'David Leroy', email: 'david@mail.com', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=David&backgroundColor=f59e0b', role: 'admin', department: 'Direction', position: 'Directeur', phone: '06 45 67 89 01', joinedAt: iso('2026-05-15') },
    { id: 'm5', projectId: 'proj2', name: 'Eva Bernard', email: 'eva@mail.com', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Eva&backgroundColor=8b5cf6', role: 'member', department: 'RH', position: 'Manager RH', phone: '06 56 78 90 12', joinedAt: iso('2026-05-20') },
    { id: 'm6', projectId: 'proj3', name: 'Faten Khediri', email: 'faten@mail.com', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Faten&backgroundColor=ec4899', role: 'admin', department: 'Marketing', position: 'CMO', phone: '06 67 89 01 23', joinedAt: iso('2026-07-01') },
  ];
  localStorage.setItem(k('members'), JSON.stringify(members));

  // === MILESTONES ===
  const milestones = [
    { id: 'ms1', projectId: 'proj1', title: 'Maquettes finalisees', description: 'Validation des maquettes desktop et mobile', dueDate: '2026-08-01', completed: true, order: 0, createdAt: iso('2026-07-01') },
    { id: 'ms2', projectId: 'proj1', title: 'Developpement termine', description: 'Toutes les pages sont developpees', dueDate: '2026-08-15', completed: false, order: 1, createdAt: iso('2026-07-01') },
    { id: 'ms3', projectId: 'proj1', title: 'Tests et deploiement', description: 'Tests QA + mise en production', dueDate: '2026-08-25', completed: false, order: 2, createdAt: iso('2026-07-01') },
    { id: 'ms4', projectId: 'proj2', title: 'Audit termine', description: 'Rapport d\'audit finance valide', dueDate: '2026-07-15', completed: true, order: 0, createdAt: iso('2026-06-01') },
    { id: 'ms5', projectId: 'proj2', title: 'Plan d\'action', description: 'Feuille de route pour Q3', dueDate: '2026-07-30', completed: false, order: 1, createdAt: iso('2026-06-01') },
    { id: 'ms6', projectId: 'proj3', title: 'Campagne lancee', description: 'Lancement reseaux sociaux', dueDate: '2026-07-20', completed: false, order: 0, createdAt: iso('2026-07-05') },
  ];
  localStorage.setItem(k('milestones'), JSON.stringify(milestones));

  // === PROJETS ===
  const projects = [
    {
      id: 'proj1', name: 'Refonte Site Web', description: 'Refonte complete du site vitrine avec nouveau design responsive et optimisation SEO.',
      status: 'active', color: '#3b82f6', icon: '🚀', startDate: '2026-07-01', endDate: '2026-08-30', budget: 15000,
      memberIds: ['m1','m2','m3'], taskIds: ['t1','t2','t3','t4','t5'], milestoneIds: ['ms1','ms2','ms3'],
      ownerId: uid, createdAt: iso('2026-07-01'), updatedAt: iso('2026-07-23'), deletedAt: null,
    },
    {
      id: 'proj2', name: 'Audit Interne Q3', description: 'Audit organisationnel et financier du premier semestre. Rapport a presenter au CA.',
      status: 'active', color: '#f59e0b', icon: '📊', startDate: '2026-06-01', endDate: '2026-07-31', budget: 5000,
      memberIds: ['m4','m5'], taskIds: ['t6','t7','t8'], milestoneIds: ['ms4','ms5'],
      ownerId: uid, createdAt: iso('2026-06-01'), updatedAt: iso('2026-07-20'), deletedAt: null,
    },
    {
      id: 'proj3', name: 'Campagne Ete 2026', description: 'Campagne marketing estivale sur Instagram, TikTok et LinkedIn.',
      status: 'active', color: '#ec4899', icon: '📢', startDate: '2026-07-10', endDate: '2026-09-01', budget: 8000,
      memberIds: ['m6'], taskIds: ['t9','t10'], milestoneIds: ['ms6'],
      ownerId: uid, createdAt: iso('2026-07-10'), updatedAt: iso('2026-07-23'), deletedAt: null,
    },
  ];
  localStorage.setItem(k('projects'), JSON.stringify(projects));

  // === TACHES ===
  const tasks = [
    { id:'t1', title:'Creer les maquettes Figma', description:'Designer les maquettes desktop et mobile pour toutes les pages du site.', status:'done', priority:'high', category:'work', dueDate:'2026-07-15', projectId:'proj1', tags:['stag5','stag8'], attachments:[], reminders:[], subtasks:[{id:id(),title:'Maquette desktop',completed:true,priority:'high',timeEstimate:120,timeSpent:100},{id:id(),title:'Maquette mobile',completed:true,priority:'high',timeEstimate:90,timeSpent:85}], recurrence:'none', archived:false, completedAt:iso('2026-07-14'), deletedAt:null, order:0, createdAt:iso('2026-07-01'), updatedAt:iso('2026-07-14') },
    { id:'t2', title:'Integrer la page d\'accueil', description:'Integrer le header, hero section, features et footer avec Tailwind.', status:'in-progress', priority:'high', category:'work', dueDate:'2026-07-25', projectId:'proj1', tags:['stag5'], attachments:[], reminders:[{id:id(),date:'2026-07-24',time:'09:00',message:'Verifier l\'integration',triggered:false}], subtasks:[{id:id(),title:'Header + Nav',completed:true,priority:'medium',timeEstimate:60,timeSpent:55},{id:id(),title:'Hero section',completed:true,priority:'medium',timeEstimate:45,timeSpent:50},{id:id(),title:'Features grid',completed:false,priority:'medium',timeEstimate:60,timeSpent:20},{id:id(),title:'Footer',completed:false,priority:'low',timeEstimate:30,timeSpent:0}], recurrence:'none', archived:false, completedAt:null, deletedAt:null, order:1, createdAt:iso('2026-07-10'), updatedAt:iso('2026-07-23') },
    { id:'t3', title:'Configurer le SEO', description:'Meta tags, sitemap, robots.txt, schema.org, Open Graph.', status:'todo', priority:'medium', category:'work', dueDate:'2026-08-10', projectId:'proj1', tags:['stag5','stag2'], attachments:[], reminders:[], subtasks:[], recurrence:'none', archived:false, completedAt:null, deletedAt:null, order:2, createdAt:iso('2026-07-10'), updatedAt:iso('2026-07-10') },
    { id:'t4', title:'Corriger le bug responsive tablette', description:'Les images debordent sur les ecrans 768px-1024px.', status:'todo', priority:'high', category:'work', dueDate:today, projectId:'proj1', tags:['stag5','stag7'], attachments:[], reminders:[], subtasks:[], recurrence:'none', archived:false, completedAt:null, deletedAt:null, order:3, createdAt:iso('2026-07-20'), updatedAt:iso('2026-07-20') },
    { id:'t5', title:'Reunion de suivi projet', description:'Point hebdomadaire avec l\'equipe sur l\'avancement.', status:'done', priority:'low', category:'work', dueDate:'2026-07-18', projectId:'proj1', tags:['stag4','stag5'], attachments:[], reminders:[], subtasks:[], recurrence:'weekly', archived:false, completedAt:iso('2026-07-18'), deletedAt:null, order:4, createdAt:iso('2026-07-01'), updatedAt:iso('2026-07-18') },

    { id:'t6', title:'Rassembler les bilans financiers', description:'Consolider les bilans Q1 et Q2.', status:'done', priority:'high', category:'finance', dueDate:'2026-07-05', projectId:'proj2', tags:['stag1','stag2'], attachments:[], reminders:[], subtasks:[{id:id(),title:'Bilan Q1',completed:true,priority:'high',timeEstimate:180,timeSpent:200},{id:id(),title:'Bilan Q2',completed:true,priority:'high',timeEstimate:180,timeSpent:160}], recurrence:'none', archived:false, completedAt:iso('2026-07-05'), deletedAt:null, order:5, createdAt:iso('2026-06-15'), updatedAt:iso('2026-07-05') },
    { id:'t7', title:'Interview les managers', description:'Conduire les entretiens avec les 5 managers departement.', status:'in-progress', priority:'medium', category:'work', dueDate:'2026-07-20', projectId:'proj2', tags:['stag4'], attachments:[], reminders:[], subtasks:[{id:id(),title:'Mgr Production',completed:true,priority:'medium',timeEstimate:45,timeSpent:50},{id:id(),title:'Mgr Commercial',completed:true,priority:'medium',timeEstimate:45,timeSpent:40},{id:id(),title:'Mgr RH',completed:false,priority:'medium',timeEstimate:45,timeSpent:0},{id:id(),title:'Mgr IT',completed:false,priority:'medium',timeEstimate:45,timeSpent:0},{id:id(),title:'Mgr Finance',completed:false,priority:'medium',timeEstimate:45,timeSpent:0}], recurrence:'none', archived:false, completedAt:null, deletedAt:null, order:6, createdAt:iso('2026-07-01'), updatedAt:iso('2026-07-23') },
    { id:'t8', title:'Rediger le rapport final', description:'Synthese de l\'audit avec recommandations.', status:'todo', priority:'high', category:'work', dueDate:'2026-07-28', projectId:'proj2', tags:['stag2'], attachments:[], reminders:[], subtasks:[], recurrence:'none', archived:false, completedAt:null, deletedAt:null, order:7, createdAt:iso('2026-07-10'), updatedAt:iso('2026-07-10') },

    { id:'t9', title:'Creer les visuels Instagram', description:'12 visuels pour la campagne estivale.', status:'in-progress', priority:'high', category:'work', dueDate:'2026-07-18', projectId:'proj3', tags:['stag8'], attachments:[], reminders:[], subtasks:[{id:id(),title:'Visuels produits',completed:true,priority:'high',timeEstimate:120,timeSpent:130},{id:id(),title:'Visuels lifestyle',completed:false,priority:'medium',timeEstimate:90,timeSpent:30},{id:id(),title:'Stories',completed:false,priority:'low',timeEstimate:60,timeSpent:0}], recurrence:'none', archived:false, completedAt:null, deletedAt:null, order:8, createdAt:iso('2026-07-10'), updatedAt:iso('2026-07-23') },
    { id:'t10', title:'Planifier les publications', description:'Scheduler 30 posts sur un mois avec Hootsuite.', status:'todo', priority:'medium', category:'work', dueDate:'2026-07-25', projectId:'proj3', tags:['stag5'], attachments:[], reminders:[], subtasks:[], recurrence:'none', archived:false, completedAt:null, deletedAt:null, order:9, createdAt:iso('2026-07-12'), updatedAt:iso('2026-07-12') },

    { id:'t11', title:'Rendez-vous medecin', description:'Check-up annuel.', status:'done', priority:'medium', category:'health', dueDate:'2026-07-10', projectId:'', tags:['stag3'], attachments:[], reminders:[], subtasks:[], recurrence:'none', archived:false, completedAt:iso('2026-07-10'), deletedAt:null, order:10, createdAt:iso('2026-07-01'), updatedAt:iso('2026-07-10') },
    { id:'t12', title:'Livre "Atomic Habits"', description:'Terminer la lecture du livre.', status:'in-progress', priority:'low', category:'education', dueDate:'2026-08-01', projectId:'', tags:['stag3'], attachments:[], reminders:[], subtasks:[{id:id(),title:'Chap. 1-5',completed:true,priority:'low',timeEstimate:60,timeSpent:70},{id:id(),title:'Chap. 6-10',completed:true,priority:'low',timeEstimate:60,timeSpent:55},{id:id(),title:'Chap. 11-17',completed:false,priority:'low',timeEstimate:60,timeSpent:20}], recurrence:'none', archived:false, completedAt:null, deletedAt:null, order:11, createdAt:iso('2026-06-15'), updatedAt:iso('2026-07-23') },
    { id:'t13', title:'Budget vacances', description:'Estimer le budget pour les vacances d\'aout.', status:'todo', priority:'medium', category:'finance', dueDate:'2026-07-30', projectId:'', tags:['stag3','stag2'], attachments:[], reminders:[], subtasks:[], recurrence:'none', archived:false, completedAt:null, deletedAt:null, order:12, createdAt:iso('2026-07-05'), updatedAt:iso('2026-07-05') },
    { id:'t14', title:'Organiser soiree', description:'Preparer la soiree vendredi avec les amis.', status:'todo', priority:'low', category:'personal', dueDate:'2026-07-25', projectId:'', tags:['stag3'], attachments:[], reminders:[{id:id(),date:'2026-07-24',time:'18:00',message:'Acheter les courses',triggered:false}], subtasks:[{id:id(),title:'Envoyer les invitations',completed:true,priority:'low',timeEstimate:10,timeSpent:5},{id:id(),title:'Acheter boissons',completed:false,priority:'medium',timeEstimate:30,timeSpent:0},{id:id(),title:'Commander pizza',completed:false,priority:'low',timeEstimate:10,timeSpent:0}], recurrence:'none', archived:false, completedAt:null, deletedAt:null, order:13, createdAt:iso('2026-07-15'), updatedAt:iso('2026-07-23') },
    { id:'t15', title:'Appeler maman', description:'Lui souhaiter bon anniversaire.', status:'done', priority:'high', category:'personal', dueDate:'2026-07-20', projectId:'', tags:['stag3','stag1'], attachments:[], reminders:[], subtasks:[], recurrence:'none', archived:false, completedAt:iso('2026-07-20'), deletedAt:null, order:14, createdAt:iso('2026-07-10'), updatedAt:iso('2026-07-20') },
  ];
  localStorage.setItem(k('tasks'), JSON.stringify(tasks));

  // === GAMIFICATION ===
  const gamification = {
    xp: 185, level: 3, badges: ['first_task','ten_tasks','streak_3','fifty_xp','early_bird'],
    streak: 4, lastCompletionDate: today, tasksCompletedToday: 2, weeklyGoal: 10,
  };
  localStorage.setItem(k('gamification'), JSON.stringify(gamification));

  // === NOTIFICATIONS ===
  const notifications = [
    { id:id(), type:'reminder', title:'Rappel: Integrer la page d\'accueil', message:'Verifier l\'integration demain', read:false, createdAt:iso('2026-07-23'), taskId:'t2' },
    { id:id(), type:'dueToday', title:'Echeance aujourd\'hui: Bug responsive', message:'Le bug responsive est due aujourd\'hui', read:false, createdAt:iso('2026-07-23'), taskId:'t4' },
    { id:id(), type:'info', title:'Bienvenue dans TaskZen !', message:'Commencez par creer votre premiere tache.', read:true, createdAt:iso('2026-07-01') },
  ];
  localStorage.setItem(k('notifications'), JSON.stringify(notifications));

  // === ACTIVITY LOGS ===
  const activityLogs = [
    { id:id(), projectId:'proj1', memberId:'m1', memberName:'Alice Martin', action:'created', details:'Projet "Refonte Site Web" cree', createdAt:iso('2026-07-01') },
    { id:id(), projectId:'proj1', memberId:'m1', memberName:'Alice Martin', action:'member_added', details:'Bob Dupont a rejoint le projet', createdAt:iso('2026-07-05') },
    { id:id(), projectId:'proj1', memberId:'m1', memberName:'Alice Martin', action:'member_added', details:'Clara Ruiz a rejoint le projet', createdAt:iso('2026-07-10') },
    { id:id(), projectId:'proj1', memberId:'m2', memberName:'Bob Dupont', action:'milestone_completed', details:'Jalon "Maquettes finalisees" termine', createdAt:iso('2026-07-14') },
    { id:id(), projectId:'proj2', memberId:'m4', memberName:'David Leroy', action:'created', details:'Projet "Audit Interne Q3" cree', createdAt:iso('2026-06-01') },
    { id:id(), projectId:'proj2', memberId:'m4', memberName:'David Leroy', action:'milestone_completed', details:'Jalon "Audit termine" termine', createdAt:iso('2026-07-05') },
    { id:id(), projectId:'proj3', memberId:'m6', memberName:'Faten Khediri', action:'created', details:'Projet "Campagne Ete 2026" cree', createdAt:iso('2026-07-10') },
  ];
  localStorage.setItem(k('activityLogs'), JSON.stringify(activityLogs));

  alert('✅ Simulation chargee ! Recharge la page.');
})();
