interface SidebarProps {
  isOpen: boolean;
  currentView: string;
  onNavigate: (view: string) => void;
  taskStats: {
    total: number; todo: number; inProgress: number; done: number;
    overdue: number; dueToday: number;
  };
  trashCount: number;
  projectCount: number;
}

export default function Sidebar({ isOpen, currentView, onNavigate, taskStats, trashCount, projectCount }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
    { id: 'tasks', label: 'Mes taches', icon: '📋' },
    { id: 'projects', label: 'Projets', icon: '📁', badge: projectCount },
    { id: 'archive', label: 'Archive', icon: '📦' },
    { id: 'trash', label: 'Corbeille', icon: '🗑', badge: trashCount },
    { id: 'tags', label: 'Etiquettes', icon: '🏷️' },
    { id: 'settings', label: 'Parametres', icon: '⚙️' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="sidebar-logo">
        <span className="logo-icon">⚡</span>
        {isOpen && <span className="logo-text">TaskZen</span>}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button key={item.id} className={`nav-item ${currentView === item.id ? 'nav-active' : ''}`}
            onClick={() => onNavigate(item.id)}>
            <span>{item.icon}</span>
            {isOpen && <span>{item.label}</span>}
            {(item as any).badge > 0 && isOpen && <span className="nav-badge">{(item as any).badge}</span>}
          </button>
        ))}
      </nav>

      {isOpen && (
        <div className="sidebar-stats">
          <h4>Resume rapide</h4>
          <div className="sidebar-stat-row"><span>⬜ A faire</span><span className="stat-badge stat-badge-todo">{taskStats.todo}</span></div>
          <div className="sidebar-stat-row"><span>🔄 En cours</span><span className="stat-badge stat-badge-progress">{taskStats.inProgress}</span></div>
          <div className="sidebar-stat-row"><span>✅ Termine</span><span className="stat-badge stat-badge-done">{taskStats.done}</span></div>
          {taskStats.overdue > 0 && (
            <div className="sidebar-stat-row"><span>⚠️ En retard</span><span className="stat-badge stat-badge-overdue">{taskStats.overdue}</span></div>
          )}
        </div>
      )}
    </aside>
  );
}
