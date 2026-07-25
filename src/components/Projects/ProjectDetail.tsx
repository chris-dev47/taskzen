import { useState } from 'react';
import { Project, Member, Milestone } from '../../types/project';
import { Task } from '../../types/task';
import { User } from '../../types/user';
import { formatDateRelative } from '../../utils/helpers';

interface Props {
  project: Project;
  members: Member[];
  milestones: Milestone[];
  tasks: Task[];
  allTasks: Task[];
  allUsers: User[];
  currentUserId: string;
  onBack: () => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onAddMember: (data: Omit<Member, 'id' | 'projectId' | 'joinedAt'>) => void;
  onRemoveMember: (memberId: string) => void;
  onUpdateMember: (memberId: string, data: Partial<Member>) => void;
  onAddMilestone: (data: Omit<Milestone, 'id' | 'projectId' | 'createdAt' | 'order'>) => void;
  onToggleMilestone: (milestoneId: string, title: string) => void;
  onDeleteMilestone: (milestoneId: string) => void;
  onChangeStatus: (status: Project['status']) => void;
}

type Tab = 'overview' | 'tasks' | 'members' | 'milestones';

const STATUS_LABELS: Record<string, string> = { active: 'Actif', completed: 'Termine', archived: 'Archive' };
const ROLE_LABELS: Record<string, string> = { admin: 'Admin', member: 'Membre', viewer: 'Observateur' };

export default function ProjectDetail({
  project, members, milestones, tasks, allTasks, allUsers, currentUserId, onBack, onEdit, onDelete, onRestore,
  onAddMember, onRemoveMember, onUpdateMember, onAddMilestone, onToggleMilestone, onDeleteMilestone, onChangeStatus,
}: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const projectTasks = allTasks.filter((t) => t.projectId === project.id && !t.deletedAt);
  const doneTasks = projectTasks.filter((t) => t.status === 'done').length;
  const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0;
  const completedMilestones = milestones.filter((m) => m.completed).length;
  const milestoneProgress = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  const currentMember = members.find((m) => m.userId === currentUserId);
  const isAdmin = project.ownerId === currentUserId || currentMember?.role === 'admin';

  const handleAddMember = () => {
    const selectedUser = allUsers.find((u) => u.id === selectedUserId);
    if (!selectedUser) return;
    onAddMember({
      userId: selectedUser.id,
      name: selectedUser.name,
      email: selectedUser.email,
      avatar: selectedUser.avatar,
      role: newMemberRole,
      department: '',
      position: '',
      phone: '',
    });
    setSelectedUserId('');
    setNewMemberRole('member');
    setShowAddMember(false);
  };

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    onAddMilestone({
      title: newMilestoneTitle.trim(), description: newMilestoneDesc.trim(),
      dueDate: newMilestoneDate, completed: false,
    });
    setNewMilestoneTitle(''); setNewMilestoneDesc(''); setNewMilestoneDate('');
    setShowAddMilestone(false);
  };

  return (
    <div className="project-detail">
      <div className="project-detail-header" style={{ borderLeftColor: project.color }}>
        <div className="project-detail-top">
          <button className="btn btn-secondary btn-sm" onClick={onBack}>← Retour</button>
          <div className="project-detail-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => onEdit(project)}>✏️ Modifier</button>
            {project.deletedAt ? (
              <button className="btn btn-primary btn-sm" onClick={() => onRestore(project.id)}>↩ Restaurer</button>
            ) : (
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(project.id)}>🗑 Supprimer</button>
            )}
          </div>
        </div>

        <div className="project-detail-title">
          <span className="project-icon-lg">{project.icon}</span>
          <div>
            <h1>{project.name}</h1>
            {project.description && <p className="text-secondary">{project.description}</p>}
          </div>
        </div>

        <div className="project-detail-meta">
          <span className={`project-status-badge project-status-${project.status}`}>
            {STATUS_LABELS[project.status]}
          </span>
          {project.startDate && <span>📅 Debut: {formatDateRelative(project.startDate)}</span>}
          {project.endDate && <span className={new Date(project.endDate) < new Date() ? 'text-overdue' : ''}>📅 Fin: {formatDateRelative(project.endDate)}</span>}
          {project.budget > 0 && <span>💰 Budget: {project.budget.toLocaleString('fr-FR')} FCFA</span>}
        </div>

        <div className="project-status-buttons">
          {(['active', 'completed', 'archived'] as const).map((s) => (
            <button key={s} className={`btn btn-sm ${project.status === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onChangeStatus(s)} disabled={project.status === s}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="project-tabs">
        {(['overview', 'tasks', 'members', 'milestones'] as const).map((t) => (
          <button key={t} className={`project-tab ${tab === t ? 'project-tab-active' : ''}`} onClick={() => setTab(t)}>
            {t === 'overview' ? '📊 Vue d\'ensemble' : t === 'tasks' ? `📋 Taches (${projectTasks.length})` : t === 'members' ? `👥 Equipe (${members.length})` : `🎯 Jalons (${milestones.length})`}
          </button>
        ))}
      </div>

      <div className="project-tab-content">
        {tab === 'overview' && (
          <div className="project-overview">
            <div className="overview-stats">
              <div className="overview-stat-card">
                <span className="overview-stat-icon">📋</span>
                <span className="overview-stat-number">{projectTasks.length}</span>
                <span className="overview-stat-label">Taches totales</span>
              </div>
              <div className="overview-stat-card">
                <span className="overview-stat-icon">✅</span>
                <span className="overview-stat-number">{doneTasks}</span>
                <span className="overview-stat-label">Terminees</span>
              </div>
              <div className="overview-stat-card">
                <span className="overview-stat-icon">🎯</span>
                <span className="overview-stat-number">{completedMilestones}</span>
                <span className="overview-stat-label">Jalons valides</span>
              </div>
              <div className="overview-stat-card">
                <span className="overview-stat-icon">👥</span>
                <span className="overview-stat-number">{members.length}</span>
                <span className="overview-stat-label">Membres</span>
              </div>
            </div>

            <div className="overview-section">
              <h3>Progression des taches</h3>
              <div className="progress-bar-lg">
                <div className="progress-fill-lg" style={{ width: `${progress}%`, backgroundColor: project.color }} />
              </div>
              <span className="progress-text">{progress}% ({doneTasks}/{projectTasks.length})</span>
            </div>

            {milestones.length > 0 && (
              <div className="overview-section">
                <h3>Progression des jalons</h3>
                <div className="progress-bar-lg">
                  <div className="progress-fill-lg" style={{ width: `${milestoneProgress}%`, backgroundColor: '#10b981' }} />
                </div>
                <span className="progress-text">{milestoneProgress}% ({completedMilestones}/{milestones.length})</span>
              </div>
            )}

            {projectTasks.length > 0 && (
              <div className="overview-section">
                <h3>Dernieres taches</h3>
                <div className="overview-task-list">
                  {projectTasks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5).map((task) => (
                    <div key={task.id} className="overview-task-item">
                      <span className={`status-dot status-dot-${task.status}`} />
                      <span className={task.status === 'done' ? 'text-done' : ''}>{task.title}</span>
                      <span className="text-secondary">{formatDateRelative(task.updatedAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {members.length > 0 && (
              <div className="overview-section">
                <h3>Equipe</h3>
                <div className="overview-members">
                  {members.slice(0, 6).map((m) => (
                    <div key={m.id} className="overview-member">
                      <img src={m.avatar} alt={m.name} className="member-avatar-sm" />
                      <span>{m.name}</span>
                      <span className="member-role-badge">{ROLE_LABELS[m.role]}</span>
                    </div>
                  ))}
                  {members.length > 6 && <span className="text-secondary">+{members.length - 6} autres</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'tasks' && (
          <div className="project-tasks-tab">
            <p className="text-secondary">Les taches liees a ce projet apparaissent dans la vue Taches avec le badge du projet.</p>
            {projectTasks.length > 0 ? (
              <div className="overview-task-list">
                {projectTasks.map((task) => (
                  <div key={task.id} className="overview-task-item">
                    <span className={`status-dot status-dot-${task.status}`} />
                    <span className={task.status === 'done' ? 'text-done' : ''}>{task.title}</span>
                    <span className="text-secondary">{formatDateRelative(task.updatedAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>Aucune tache</h3>
                <p>Associez des taches a ce projet depuis le formulaire de tache.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'members' && (
          <div className="project-members-tab">
            <div className="members-header">
              <h3>Equipe du projet ({members.length})</h3>
              {isAdmin && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddMember(!showAddMember)}>
                  {showAddMember ? '✕ Annuler' : '+ Ajouter un membre'}
                </button>
              )}
            </div>

            {showAddMember && (
              <div className="add-member-form">
                {(() => {
                  const available = allUsers.filter((u) => !members.some((m) => m.userId === u.id));
                  if (available.length === 0) {
                    return <p className="text-secondary text-sm">Aucun autre utilisateur inscrit. Invitez des gens a s'inscrire pour les ajouter.</p>;
                  }
                  return (
                    <div className="form-row-2">
                      <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                        <option value="">-- Selectionner un utilisateur --</option>
                        {available.map((u) => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                      </select>
                      <select value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value as any)}>
                        <option value="admin">Admin</option>
                        <option value="member">Membre</option>
                        <option value="viewer">Observateur</option>
                      </select>
                    </div>
                  );
                })()}
                <button className="btn btn-primary btn-sm" onClick={handleAddMember} disabled={!selectedUserId}>Ajouter</button>
              </div>
            )}

            <div className="members-list">
              {members.map((member) => (
                <div key={member.id} className="member-card">
                  <img src={member.avatar} alt={member.name} className="member-avatar" />
                  <div className="member-info">
                    <strong>{member.name}</strong>
                    <span className="text-secondary">{member.email}</span>
                    {member.position && <span className="text-secondary">{member.position}{member.department ? ` - ${member.department}` : ''}</span>}
                  </div>
                  <span className="member-role-badge">{ROLE_LABELS[member.role]}</span>
                  {isAdmin && member.userId !== currentUserId && (
                    <div className="member-actions">
                      <button className="btn-icon-sm" onClick={() => setEditingMemberId(editingMemberId === member.id ? null : member.id)} title="Modifier le role">✏️</button>
                      <button className="btn-icon-sm btn-icon-danger" onClick={() => onRemoveMember(member.id)} title="Retirer">✕</button>
                    </div>
                  )}
                  {editingMemberId === member.id && isAdmin && (
                    <div className="member-edit-row">
                      <select value={member.role} onChange={(e) => { onUpdateMember(member.id, { role: e.target.value as any }); setEditingMemberId(null); }}>
                        <option value="admin">Admin</option>
                        <option value="member">Membre</option>
                        <option value="viewer">Observateur</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
              {members.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>Aucun membre</h3>
                  <p>Ajoutez des membres a l'equipe.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'milestones' && (
          <div className="project-milestones-tab">
            <div className="milestones-header">
              <h3>Jalons ({milestones.length})</h3>
              {isAdmin && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddMilestone(!showAddMilestone)}>
                  {showAddMilestone ? '✕ Annuler' : '+ Ajouter un jalon'}
                </button>
              )}
            </div>

            {showAddMilestone && isAdmin && (
              <div className="add-milestone-form">
                <input type="text" placeholder="Titre du jalon *" value={newMilestoneTitle} onChange={(e) => setNewMilestoneTitle(e.target.value)} />
                <input type="text" placeholder="Description" value={newMilestoneDesc} onChange={(e) => setNewMilestoneDesc(e.target.value)} />
                <input type="date" value={newMilestoneDate} onChange={(e) => setNewMilestoneDate(e.target.value)} />
                <button className="btn btn-primary btn-sm" onClick={handleAddMilestone} disabled={!newMilestoneTitle.trim()}>Ajouter</button>
              </div>
            )}

            <div className="milestones-list">
              {milestones.map((milestone) => (
                <div key={milestone.id} className={`milestone-card ${milestone.completed ? 'milestone-done' : ''}`}>
                  <button className={`milestone-check ${milestone.completed ? 'milestone-checked' : ''}`}
                    onClick={() => isAdmin && onToggleMilestone(milestone.id, milestone.title)}>
                    {milestone.completed ? '✓' : ''}
                  </button>
                  <div className="milestone-info">
                    <strong className={milestone.completed ? 'text-done' : ''}>{milestone.title}</strong>
                    {milestone.description && <p className="text-secondary">{milestone.description}</p>}
                    {milestone.dueDate && (
                      <span className={`milestone-date ${new Date(milestone.dueDate) < new Date() && !milestone.completed ? 'text-overdue' : ''}`}>
                        📅 {formatDateRelative(milestone.dueDate)}
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <button className="btn-icon-sm btn-icon-danger" onClick={() => onDeleteMilestone(milestone.id)} title="Supprimer">✕</button>
                  )}
                </div>
              ))}
              {milestones.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🎯</div>
                  <h3>Aucun jalon</h3>
                  <p>Definissez des jalons pour suivre l'avancement.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
