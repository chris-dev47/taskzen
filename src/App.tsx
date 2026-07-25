import { useState, useCallback, useMemo } from 'react';
import { useAuth } from './hooks/useAuth';
import { useDarkMode } from './hooks/useDarkMode';
import { useTasks } from './hooks/useTasks';
import { useProjects } from './hooks/useProjects';
import { useNotifications } from './hooks/useNotifications';
import { useGamification } from './hooks/useGamification';
import { Task } from './types/task';
import { Project } from './types/project';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Stats';
import TaskForm from './components/Tasks/TaskForm';
import TaskList from './components/Tasks/TaskList';
import TaskDetail from './components/Tasks/TaskDetail';
import FilterBar from './components/Filters/FilterBar';
import TagsManager from './components/Tags/TagsManager';
import Settings from './components/Settings/Settings';
import Archive from './components/Tasks/Archive';
import Trash from './components/Tasks/Trash';
import FocusMode from './components/Tasks/FocusMode';
import ProjectsList from './components/Projects/ProjectsList';
import ProjectForm from './components/Projects/ProjectForm';
import ProjectDetail from './components/Projects/ProjectDetail';
import ProjectTrash from './components/Projects/ProjectTrash';
import ZenBot from './components/Common/ZenBot';
import BreathingExercise from './components/Common/BreathingExercise';
import DatabaseViewer from './components/Common/DatabaseViewer';
import Modal from './components/Common/Modal';
import Toast from './components/Common/Toast';
import ConfirmDialog from './components/Common/ConfirmDialog';
import { getTaskStats } from './utils/helpers';
import { exportToJSON, exportToCSV } from './utils/export';

type ToastData = { message: string; type: 'success' | 'error' | 'info' | 'warning' };

export default function App() {
  const auth = useAuth();
  const userId = auth.user?.id;
  const darkMode = useDarkMode(userId);
  const projects = useProjects(userId);
  const projectIds = useMemo(() => projects.userProjects.map(p => p.id), [projects.userProjects]);
  const tasks = useTasks(userId, projectIds);
  const notifications = useNotifications(tasks.allTasks, userId);
  const gamification = useGamification(userId);

  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [showZenBot, setShowZenBot] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showDatabase, setShowDatabase] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [toast, setToast] = useState<ToastData | null>(null);

  // Projects state
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [showProjectTrash, setShowProjectTrash] = useState(false);

  const showToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
    setToast({ message, type });
  }, []);

  const stats = getTaskStats(tasks.allTasks);
  const trashCount = tasks.allTasks.filter((t) => t.deletedAt).length;

  const handleAddTask = (data: Parameters<typeof tasks.addTask>[0]) => {
    tasks.addTask(data);
    setShowTaskForm(false);
    showToast('✅ Tache creee avec succes');
  };

  const handleUpdateTask = (data: Partial<Task>) => {
    if (!editingTask) return;
    tasks.updateTask(editingTask.id, data);
    setEditingTask(null);
    setShowTaskForm(false);
    showToast('✅ Tache mise a jour');
  };

  const handleDeleteTask = () => {
    if (!deletingTaskId) return;
    tasks.deleteTask(deletingTaskId);
    setDeletingTaskId(null);
    showToast('🗑 Tache envoyee a la corbeille', 'info');
  };

  const handleEditTask = (task: Task) => { setEditingTask(task); setShowTaskForm(true); setViewingTask(null); };
  const handleViewDetail = (task: Task) => setViewingTask(task);
  const handleStartFocus = (task: Task) => { setFocusTask(task); setViewingTask(null); };
  const handleNavigate = (view: string) => { setCurrentView(view); setViewingTask(null); setViewingProject(null); };

  const handleToggleStatusWithGamification = (id: string) => {
    const task = tasks.allTasks.find((t) => t.id === id);
    if (task && task.status !== 'done') {
      gamification.checkStreak();
      gamification.awardXP(task.priority);
      const newBadges = gamification.checkBadges(tasks.allTasks);
      if (newBadges.length > 0) {
        const badgeNames = newBadges.map((b) => (gamification as any).BADGES[b]?.name || b).join(', ');
        showToast(`🏅 Badge debloque : ${badgeNames}`, 'info');
      }
    }
    tasks.toggleStatus(id);
  };

  const handleArchiveTask = (id: string) => { tasks.archiveTask(id); showToast('📦 Tache archivee', 'info'); };
  const handleRestoreTask = (id: string) => { tasks.restoreTask(id); showToast('↩ Tache restauree', 'info'); };
  const handleClearArchive = () => { tasks.clearArchive(); showToast('🗑 Archive videe', 'info'); };

  const handleRestoreFromTrash = (id: string) => { tasks.restoreFromTrash(id); showToast('↩ Tache restauree', 'info'); };
  const handleDeletePermanently = (id: string) => { tasks.deletePermanently(id); showToast('🗑 Suppression definitive', 'warning'); };
  const handleEmptyTrash = () => { tasks.emptyTrash(); showToast('🗑 Corbeille videe', 'info'); };

  // Project handlers
  const user = auth.user!;
  const handleAddProject = (data: any) => {
    projects.addProject({ ...data, ownerId: user.id }, user.id, user.name);
    setShowProjectForm(false);
    showToast('✅ Projet cree avec succes');
  };

  const handleUpdateProject = (data: Partial<Project>) => {
    if (!editingProject) return;
    projects.updateProject(editingProject.id, data, user.id, user.name);
    setEditingProject(null);
    setShowProjectForm(false);
    showToast('✅ Projet mis a jour');
  };

  const handleDeleteProject = () => {
    if (!deletingProjectId) return;
    projects.deleteProject(deletingProjectId);
    setDeletingProjectId(null);
    setViewingProject(null);
    showToast('🗑 Projet envoye a la corbeille', 'info');
  };

  const handleRestoreProject = (id: string) => {
    projects.restoreProject(id);
    showToast('↩ Projet restaure', 'info');
  };

  const handleSelectProject = (project: Project) => {
    setViewingProject(project);
  };

  if (!auth.isAuthenticated) {
    return authView === 'login' ? (
      <LoginPage onLogin={auth.login} onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterPage onRegister={auth.register} onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  if (focusTask) {
    return (
      <div className="app-container">
        <FocusMode
          task={tasks.allTasks.find((t) => t.id === focusTask.id) || focusTask}
          onClose={() => setFocusTask(null)}
          onToggleStatus={handleToggleStatusWithGamification}
          onAddTimeSpent={tasks.addTimeSpent}
        />
      </div>
    );
  }

  // Project detail view
  if (currentView === 'projects' && viewingProject) {
const project = projects.allProjects.find((p) => p.id === viewingProject.id) || viewingProject;
  const userProjects = projects.userProjects;
  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} currentView={currentView} onNavigate={handleNavigate}
        taskStats={stats} trashCount={trashCount} projectCount={userProjects.length} />
      <div className="main-area">
        <Header user={user} onLogout={auth.logout} isDark={darkMode.isDark} onToggleTheme={darkMode.toggle}
          notifications={notifications.notifications} unreadCount={notifications.unreadCount}
          onMarkAllRead={notifications.markAllAsRead} onClearNotifications={notifications.clearAll}
          onToggleSidebar={() => setSidebarOpen((p) => !p)} onOpenDatabase={() => setShowDatabase(true)}
          currentView={currentView} />
        <main className="main-content">
          <ProjectDetail
            project={project}
            members={projects.getProjectMembers(project.id)}
            milestones={projects.getProjectMilestones(project.id)}
            tasks={tasks.tasks}
            allTasks={tasks.allTasks}
            allUsers={auth.getAllUsers()}
            currentUserId={user.id}
              onBack={() => setViewingProject(null)}
              onEdit={(p) => { setEditingProject(p); setShowProjectForm(true); }}
              onDelete={(id) => setDeletingProjectId(id)}
              onRestore={handleRestoreProject}
              onAddMember={(data) => { projects.addMember(project.id, data, user.id, user.name); showToast('✅ Membre ajoute'); }}
              onRemoveMember={(memberId) => {
                const member = projects.members.find((m) => m.id === memberId);
                projects.removeMember(project.id, memberId, user.id, user.name, member?.name || '');
                showToast('Membre retire', 'info');
              }}
              onUpdateMember={(memberId, data) => projects.updateMember(memberId, data)}
              onAddMilestone={(data) => { projects.addMilestone(project.id, data, user.id, user.name); showToast('✅ Jalon cree'); }}
              onToggleMilestone={(milestoneId, title) => projects.toggleMilestone(milestoneId, project.id, user.id, user.name, title)}
              onDeleteMilestone={(milestoneId) => { projects.deleteMilestone(milestoneId, project.id); showToast('Jalon supprime', 'info'); }}
              onChangeStatus={(status) => { projects.changeProjectStatus(project.id, status, user.id, user.name); showToast(`Statut change`); }}
            />
          </main>
        </div>

        <Modal isOpen={showProjectForm} onClose={() => { setShowProjectForm(false); setEditingProject(null); }}
          title={editingProject ? '✏️ Modifier le projet' : '➕ Nouveau projet'} size="lg">
          <ProjectForm onSubmit={editingProject ? (data) => handleUpdateProject(data) : handleAddProject}
            onCancel={() => { setShowProjectForm(false); setEditingProject(null); }}
            initialData={editingProject || undefined} isEditing={!!editingProject} />
        </Modal>

        <ConfirmDialog isOpen={!!deletingProjectId} onClose={() => setDeletingProjectId(null)} onConfirm={handleDeleteProject}
          title="🗑 Supprimer le projet" message="Le projet sera envoye a la corbeille."
          confirmLabel="Supprimer" type="danger" />

        {showZenBot && <ZenBot tasks={tasks.allTasks} onClose={() => setShowZenBot(false)} />}
        {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
        {showDatabase && <DatabaseViewer onClose={() => setShowDatabase(false)} />}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} currentView={currentView} onNavigate={handleNavigate}
        taskStats={stats} trashCount={trashCount} projectCount={projects.userProjects.length} />

      <div className="main-area">
        <Header
          user={user} onLogout={auth.logout} isDark={darkMode.isDark} onToggleTheme={darkMode.toggle}
          notifications={notifications.notifications} unreadCount={notifications.unreadCount}
          onMarkAllRead={notifications.markAllAsRead} onClearNotifications={notifications.clearAll}
          onToggleSidebar={() => setSidebarOpen((p) => !p)} onOpenDatabase={() => setShowDatabase(true)}
          currentView={currentView}
        />

        <div className="header-actions">
          <button className="btn btn-icon-header" onClick={() => setShowZenBot(true)} title="ZenBot IA">🤖</button>
          <button className="btn btn-icon-header" onClick={() => setShowBreathing(true)} title="Exercice de respiration">🧘</button>
        </div>

        <main className="main-content">
          {currentView === 'dashboard' && (
            <Dashboard tasks={tasks.allTasks} tags={tasks.tags} onNavigate={handleNavigate} onStartFocus={handleStartFocus} />
          )}

          {currentView === 'tasks' && (
            <div className="tasks-view">
              <div className="tasks-header">
                <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowTaskForm(true); }}>➕ Nouvelle tache</button>
                <div className="export-group">
                  <button className="btn btn-secondary btn-sm" onClick={() => { exportToJSON(tasks.allTasks.filter((t) => !t.archived && !t.deletedAt)); showToast('Export JSON'); }}>📄 JSON</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { exportToCSV(tasks.allTasks.filter((t) => !t.archived && !t.deletedAt)); showToast('Export CSV'); }}>📊 CSV</button>
                </div>
              </div>
              <FilterBar filters={tasks.filters} tags={tasks.tags} onFilterChange={(f) => tasks.setFilters(f)} resultCount={tasks.tasks.length} />
              <TaskList tasks={tasks.tasks} tags={tasks.tags} projects={projects.userProjects} onToggleStatus={handleToggleStatusWithGamification}
                onEdit={handleEditTask} onViewDetail={handleViewDetail} onDelete={(id) => setDeletingTaskId(id)}
                onStartFocus={handleStartFocus} onArchive={handleArchiveTask} onReorder={tasks.reorderTasks} />
            </div>
          )}

          {currentView === 'archive' && (
            <Archive tasks={tasks.allTasks} tags={tasks.tags} onRestore={handleRestoreTask}
              onDeletePermanently={(id) => { tasks.deleteTask(id); showToast('Envoye a la corbeille', 'info'); }} onClearArchive={handleClearArchive} />
          )}

          {currentView === 'trash' && (
            <Trash tasks={tasks.allTasks} tags={tasks.tags} onRestore={handleRestoreFromTrash}
              onDeletePermanently={handleDeletePermanently} onEmptyTrash={handleEmptyTrash} />
          )}

          {currentView === 'projects' && !viewingProject && !showProjectTrash && (
            <ProjectsList
              projects={projects.userProjects} members={projects.members} milestones={projects.milestones}
              tasks={tasks.allTasks} onSelectProject={handleSelectProject}
              onCreateProject={() => { setEditingProject(null); setShowProjectForm(true); }}
              onOpenTrash={() => setShowProjectTrash(true)}
              trashedCount={projects.trashedProjects.length} />
          )}

          {currentView === 'projects' && showProjectTrash && (
            <ProjectTrash
              projects={projects.allProjects} members={projects.members} tasks={tasks.allTasks}
              onRestore={(id) => { projects.restoreProject(id); showToast('↩ Projet restaure', 'info'); }}
              onDeletePermanently={(id) => { projects.deleteProjectPermanently(id); showToast('Suppression definitive', 'warning'); }}
              onEmptyTrash={() => { projects.emptyTrash(); showToast('Corbeille projets videe', 'info'); }}
              onBack={() => setShowProjectTrash(false)} />
          )}

          {currentView === 'tags' && (
            <TagsManager tags={tasks.tags} tasks={tasks.allTasks} onAddTag={tasks.addTag}
              onUpdateTag={tasks.updateTag} onDeleteTag={tasks.deleteTag} onMergeTags={tasks.mergeTags}
              onFilterByTag={(tagId) => { tasks.setFilters({ tags: [tagId] }); setCurrentView('tasks'); }} />
          )}

{currentView === 'settings' && (
            <Settings user={user} onUpdateProfile={auth.updateProfile} onDeleteAccount={auth.deleteAccount}
              isDark={darkMode.isDark} onToggleTheme={darkMode.toggle} tasks={tasks.allTasks}
              gamification={gamification} onResetGamification={gamification.resetGamification}
              projects={projects.userProjects} members={projects.members} />
          )}
        </main>
      </div>

      <Modal isOpen={showTaskForm} onClose={() => { setShowTaskForm(false); setEditingTask(null); }}
        title={editingTask ? '✏️ Modifier la tache' : '➕ Nouvelle tache'} size="lg">
        <TaskForm onSubmit={editingTask ? (data) => handleUpdateTask(data) : handleAddTask}
          onCancel={() => { setShowTaskForm(false); setEditingTask(null); }}
          initialData={editingTask || undefined} isEditing={!!editingTask}
          tags={tasks.tags} onCreateTag={(name, color) => tasks.addTag(name, color)}
          projects={projects.userProjects} />
      </Modal>

      <Modal isOpen={!!viewingTask} onClose={() => setViewingTask(null)} title="📋 Details de la tache" size="lg">
        {viewingTask && (
          <TaskDetail task={tasks.allTasks.find((t) => t.id === viewingTask.id) || viewingTask}
            tags={tasks.tags} projects={projects.userProjects} onClose={() => setViewingTask(null)} onEdit={handleEditTask}
            onToggleStatus={handleToggleStatusWithGamification} onToggleSubtask={tasks.toggleSubtask}
            onAddSubtask={tasks.addSubtask} onDeleteSubtask={tasks.deleteSubtask}
            onAddAttachment={tasks.addAttachment} onDeleteAttachment={tasks.deleteAttachment}
            onAddReminder={tasks.addReminder} onDeleteReminder={tasks.deleteReminder} />
        )}
      </Modal>

      <Modal isOpen={showProjectForm} onClose={() => { setShowProjectForm(false); setEditingProject(null); }}
        title={editingProject ? '✏️ Modifier le projet' : '➕ Nouveau projet'} size="lg">
        <ProjectForm onSubmit={editingProject ? (data) => handleUpdateProject(data) : handleAddProject}
          onCancel={() => { setShowProjectForm(false); setEditingProject(null); }}
          initialData={editingProject || undefined} isEditing={!!editingProject} />
      </Modal>

      <ConfirmDialog isOpen={!!deletingTaskId} onClose={() => setDeletingTaskId(null)} onConfirm={handleDeleteTask}
        title="🗑 Supprimer la tache" message="La tache sera envoyee a la corbeille. Vous pourrez la restaurer."
        confirmLabel="Supprimer" type="danger" />

      {showZenBot && <ZenBot tasks={tasks.allTasks} onClose={() => setShowZenBot(false)} />}
      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
      {showDatabase && <DatabaseViewer onClose={() => setShowDatabase(false)} />}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
