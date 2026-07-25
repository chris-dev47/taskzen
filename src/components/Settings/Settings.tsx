import { useState, useRef } from 'react';
import { User } from '../../types/user';
import { Task, GamificationState } from '../../types/task';
import { Project, Member } from '../../types/project';
import { exportToJSON, exportToCSV, exportToText } from '../../utils/export';
import { storage } from '../../utils/storage';
import { runSimulation } from '../../utils/simulate';

interface SettingsProps {
  user: User;
  onUpdateProfile: (data: Partial<Pick<User, 'name' | 'avatar'>>) => void;
  onDeleteAccount: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  tasks: Task[];
  gamification: GamificationState;
  onResetGamification: () => void;
  projects: Project[];
  members: Member[];
}

export default function Settings({ user, onUpdateProfile, onDeleteAccount, isDark, onToggleTheme, tasks, gamification, onResetGamification, projects, members }: SettingsProps) {
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('taskzen_accent') || '#6366f1');
  const [previewAvatar, setPreviewAvatar] = useState(user.avatar);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!name.trim()) return;
    onUpdateProfile({ name: name.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAccentChange = (color: string) => {
    setAccentColor(color);
    document.documentElement.style.setProperty('--accent', color);
    localStorage.setItem('taskzen_accent', color);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Veuillez selectionner une image');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("L'image ne doit pas depasser 2 Mo");
      return;
    }
    const dataUrl = await storage.fileToDataUrl(file);
    setPreviewAvatar(dataUrl);
    onUpdateProfile({ avatar: dataUrl });
  };

  const handleRemovePhoto = () => {
    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1`;
    setPreviewAvatar(defaultAvatar);
    onUpdateProfile({ avatar: defaultAvatar });
  };

  return (
    <div className="settings">
      <h2>⚙️ Parametres</h2>

      <div className="settings-section">
        <h3>👤 Profil</h3>
        <div className="settings-card">
          <div className="profile-header">
            <div className="avatar-upload-container">
              <img src={previewAvatar} alt={user.name} className="user-avatar-xl" />
              <div className="avatar-upload-overlay" onClick={() => fileInputRef.current?.click()}>
                📷
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </div>
            <div>
              <div className="form-group"><label>Nom</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="form-group"><label>Email</label><input type="email" value={user.email} disabled /></div>
              <div className="profile-actions">
                <button className="btn btn-primary" onClick={handleSave}>{saved ? '✅ Sauvegarde !' : 'Sauvegarder'}</button>
                <button className="btn btn-secondary btn-sm" onClick={handleRemovePhoto}>Supprimer la photo</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>🎨 Apparence</h3>
        <div className="settings-card">
          <div className="setting-row">
            <div><strong>Mode sombre</strong><p>Theme sombre pour l'application</p></div>
            <button className={`toggle-switch ${isDark ? 'toggle-on' : ''}`} onClick={onToggleTheme}><span className="toggle-knob" /></button>
          </div>
          <hr />
          <div className="setting-row">
            <div><strong>Couleur principale</strong><p>Personnalisez la couleur de l'application</p></div>
            <div className="color-options">
              {['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'].map((c) => (
                <button key={c} className={`color-swatch ${accentColor === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }} onClick={() => handleAccentChange(c)} />
              ))}
              <input type="color" value={accentColor} onChange={(e) => handleAccentChange(e.target.value)} className="color-picker" />
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>🏆 Gamification</h3>
        <div className="settings-card">
          <div className="gamification-info">
            <p>⭐ {gamification.xp} XP | Niveau {gamification.level} | 🔥 {gamification.streak} jours</p>
            <p>🏅 {gamification.badges.length} badge{gamification.badges.length !== 1 ? 's' : ''} debloque{gamification.badges.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn btn-sm btn-danger" onClick={() => { if (window.confirm('Reinitialiser la gamification ?')) onResetGamification(); }}>
            Reinitialiser la gamification
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>📁 Mes projets</h3>
        <div className="settings-card">
          {projects.length === 0 ? (
            <p className="text-secondary">Vous n'avez pas encore de projets.</p>
          ) : (
            <div className="user-projects-list">
              {projects.map((project) => {
                const member = members.find((m) => m.userId === user.id && m.projectId === project.id);
                return (
                  <div key={project.id} className="user-project-item">
                    <span className="project-icon-md" style={{ borderLeftColor: project.color }}>{project.icon}</span>
                    <div className="user-project-info">
                      <strong>{project.name}</strong>
                      <span className="text-secondary">{project.description || 'Aucune description'}</span>
                    </div>
                    <span className={`member-role-badge member-role-${member?.role}`}>
                      {project.ownerId === user.id ? 'Proprietaire' : member?.role === 'admin' ? 'Admin' : member?.role === 'viewer' ? 'Observateur' : 'Membre'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="settings-section">
        <h3>🧪 Simulation</h3>
        <div className="settings-card">
          <p className="setting-description">Chargez des donnees de test (projets, taches, membres, jalons) pour decouvrir l'application.</p>
          <button className="btn btn-primary" onClick={() => {
            if (window.confirm('Charger les donnees de simulation ? Les donnees existantes seront remplacees.')) {
              runSimulation(user.id);
              window.location.reload();
            }
          }}>
            🚀 Charger les donnees de test
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>📤 Export des donnees</h3>
        <div className="settings-card">
          <p className="setting-description">Exportez vos {tasks.filter((t) => !t.archived).length} taches actives.</p>
          <div className="export-buttons">
            <button className="btn btn-secondary" onClick={() => exportToJSON(tasks.filter((t) => !t.archived))}>📄 JSON</button>
            <button className="btn btn-secondary" onClick={() => exportToCSV(tasks.filter((t) => !t.archived))}>📊 CSV</button>
            <button className="btn btn-secondary" onClick={() => exportToText(tasks.filter((t) => !t.archived))}>📝 TXT</button>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>⚠️ Zone dangereuse</h3>
        <div className="settings-card">
          <div className="setting-row">
            <div><strong>Reinitialiser les donnees</strong><p>Supprime toutes les taches et reinitialise l'application</p></div>
            <button className="btn btn-danger" onClick={() => { if (window.confirm('Toutes les donnees seront supprimees. Continuer ?')) { localStorage.clear(); window.location.reload(); } }}>
              Reinitialiser
            </button>
          </div>
          <hr />
          <div className="setting-row">
            <div>
              <strong>🗑 Supprimer mon compte</strong>
              <p>Supprime definitivement votre compte et toutes vos donnees (taches, projets, jalons, badges...)</p>
            </div>
            <button className="btn btn-danger" onClick={() => { setShowDeleteConfirm(true); setDeleteInput(''); }}>
              Supprimer le compte
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="delete-account-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="delete-account-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🗑 Supprimer votre compte</h3>
            <p>Cette action est <strong>irreversible</strong>. Toutes vos donnees seront supprimees :</p>
            <ul className="delete-account-list">
              <li>Toutes vos taches et sous-taches</li>
              <li>Tous vos projets, membres et jalons</li>
              <li>Votre gamification (XP, badges, streak)</li>
              <li>Vos etiquettes et notifications</li>
              <li>Votre profil et preferences</li>
            </ul>
            <div className="form-group">
              <label>Tapez <strong>SUPPRIMER</strong> pour confirmer :</label>
              <input type="text" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="SUPPRIMER" className={deleteInput === 'SUPPRIMER' ? '' : 'input-error'} autoFocus />
            </div>
            <div className="delete-account-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Annuler</button>
              <button className="btn btn-danger" disabled={deleteInput !== 'SUPPRIMER'} onClick={() => { onDeleteAccount(); }}>
                Supprimer definitivement
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="settings-section">
        <h3>ℹ️ A propos</h3>
        <div className="settings-card">
          <p><strong>TaskZen</strong> v2.0.0</p>
          <p className="text-secondary">Application de gestion de taches complete avec mode Focus, ZenBot IA, gamification, et bien plus.</p>
        </div>
      </div>
    </div>
  );
}
