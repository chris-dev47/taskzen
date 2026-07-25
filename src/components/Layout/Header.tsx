import { useState, useRef, useEffect } from 'react';
import { User } from '../../types/user';
import { Notification } from '../../types/notification';
import { formatDate } from '../../utils/helpers';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onClearNotifications: () => void;
  onToggleSidebar: () => void;
  onOpenDatabase: () => void;
  currentView: string;
}

export default function Header({
  user,
  onLogout,
  isDark,
  onToggleTheme,
  notifications,
  unreadCount,
  onMarkAllRead,
  onClearNotifications,
  onToggleSidebar,
  onOpenDatabase,
  currentView,
}: HeaderProps) {
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAvatarFull, setShowAvatarFull] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifPanel(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const viewTitles: Record<string, string> = {
    dashboard: 'Tableau de bord',
    tasks: 'Mes taches',
    archive: 'Archive',
    trash: 'Corbeille',
    tags: 'Etiquettes',
    settings: 'Parametres',
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={onToggleSidebar}>☰</button>
          <h2 className="view-title">{viewTitles[currentView] || 'TaskZen'}</h2>
        </div>

        <div className="header-right">
          <button className="btn-icon-header" onClick={onOpenDatabase} title="Base de donnees">🗄</button>
          <button className="btn-icon theme-toggle" onClick={onToggleTheme} aria-label="Changer le theme">
            {isDark ? '☀️' : '🌙'}
          </button>

          <div className="notif-wrapper" ref={notifRef}>
            <button className="btn-icon notif-trigger" onClick={() => setShowNotifPanel((p) => !p)}>
              🔔
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>

            {showNotifPanel && (
              <div className="notif-panel">
                <div className="notif-panel-header">
                  <h3>Notifications</h3>
                  <div>
                    {unreadCount > 0 && <button className="link-btn-sm" onClick={onMarkAllRead}>Tout lire</button>}
                    <button className="link-btn-sm" onClick={onClearNotifications}>Effacer</button>
                  </div>
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <p className="notif-empty">Aucune notification</p>
                  ) : (
                    notifications.slice(0, 20).map((n) => (
                      <div key={n.id} className={`notif-item ${n.read ? '' : 'notif-unread'}`}>
                        <span className="notif-type-icon">
                          {n.type === 'reminder' ? '🔔' : n.type === 'overdue' ? '⚠️' : n.type === 'dueToday' ? '📅' : 'ℹ️'}
                        </span>
                        <div className="notif-content">
                          <strong>{n.title}</strong>
                          <p>{n.message}</p>
                          <span className="notif-time">{formatDate(n.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="user-wrapper" ref={userRef}>
            <button className="user-trigger" onClick={() => setShowUserMenu((p) => !p)}>
              <img src={user.avatar} alt={user.name} className="user-avatar" />
              <span className="user-name">{user.name}</span>
            </button>

            {showUserMenu && (
              <div className="user-menu">
                <div className="user-menu-header" onClick={() => { setShowUserMenu(false); setShowAvatarFull(true); }}>
                  <img src={user.avatar} alt={user.name} className="user-avatar-lg" />
                  <div>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                    <span className="text-secondary" style={{ fontSize: '0.7rem' }}>Cliquez pour agrandir</span>
                  </div>
                </div>
                <hr />
                <button className="user-menu-item" onClick={onLogout}>🚪 Deconnexion</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showAvatarFull && (
        <div className="avatar-full-overlay" onClick={() => setShowAvatarFull(false)}>
          <div className="avatar-full-container" onClick={(e) => e.stopPropagation()}>
            <button className="avatar-full-close" onClick={() => setShowAvatarFull(false)}>✕</button>
            <img src={user.avatar} alt={user.name} className="avatar-full-img" />
            <h3>{user.name}</h3>
            <p className="text-secondary">{user.email}</p>
          </div>
        </div>
      )}
    </>
  );
}
