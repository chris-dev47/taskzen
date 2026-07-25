import { useState } from 'react';
import { Project, Member, Milestone } from '../../types/project';
import { Task } from '../../types/task';
import { formatDateRelative } from '../../utils/helpers';

interface Props {
  projects: Project[];
  members: Member[];
  milestones: Milestone[];
  tasks: Task[];
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
  onOpenTrash: () => void;
  trashedCount: number;
}

const PROJECT_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
const STATUS_LABELS: Record<string, string> = { active: 'Actif', completed: 'Termine', archived: 'Archive' };
const STATUS_ICONS: Record<string, string> = { active: '🟢', completed: '✅', archived: '📦' };

export default function ProjectsList({ projects, members, milestones, tasks, onSelectProject, onCreateProject, onOpenTrash, trashedCount }: Props) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  const getProjectStats = (project: Project) => {
    const projectTasks = tasks.filter((t) => t.projectId === project.id);
    const done = projectTasks.filter((t) => t.status === 'done').length;
    const total = projectTasks.length;
    const memberCount = members.filter((m) => m.projectId === project.id).length;
    const milestoneCount = milestones.filter((m) => m.projectId === project.id);
    const completedMilestones = milestoneCount.filter((m) => m.completed).length;
    return { total, done, memberCount, milestoneTotal: milestoneCount.length, completedMilestones };
  };

  return (
    <div className="projects-view">
      <div className="projects-header">
        <h2>📁 Mes projets ({projects.length})</h2>
        <div className="projects-header-actions">
          {trashedCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={onOpenTrash}>
              🗑 Corbeille ({trashedCount})
            </button>
          )}
          <button className="btn btn-primary" onClick={onCreateProject}>➕ Nouveau projet</button>
        </div>
      </div>

      <div className="projects-filters">
        {(['all', 'active', 'completed', 'archived'] as const).map((f) => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)}>
            {f === 'all' ? 'Tous' : STATUS_LABELS[f]} ({f === 'all' ? projects.length : projects.filter((p) => p.status === f).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>Aucun projet</h3>
          <p>Commencez par creer un nouveau projet !</p>
          <button className="btn btn-primary" onClick={onCreateProject}>➕ Creer un projet</button>
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map((project) => {
            const stats = getProjectStats(project);
            const projectMilestones = milestones.filter((m) => m.projectId === project.id);
            const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
            const milestoneProgress = stats.milestoneTotal > 0 ? Math.round((stats.completedMilestones / stats.milestoneTotal) * 100) : 0;

            return (
              <div key={project.id} className="project-card" onClick={() => onSelectProject(project)}
                style={{ borderLeftColor: project.color }}>
                <div className="project-card-header">
                  <div className="project-card-title">
                    <span className="project-icon">{project.icon}</span>
                    <h3>{project.name}</h3>
                  </div>
                  <span className={`project-status-badge project-status-${project.status}`}>
                    {STATUS_ICONS[project.status]} {STATUS_LABELS[project.status]}
                  </span>
                </div>

                {project.description && (
                  <p className="project-card-desc">{project.description.slice(0, 100)}{project.description.length > 100 ? '...' : ''}</p>
                )}

                <div className="project-card-stats">
                  <div className="project-stat">
                    <span className="project-stat-label">Taches</span>
                    <span className="project-stat-value">{stats.done}/{stats.total}</span>
                    <div className="project-mini-bar">
                      <div className="project-mini-fill" style={{ width: `${progress}%`, backgroundColor: project.color }} />
                    </div>
                  </div>
                  <div className="project-stat">
                    <span className="project-stat-label">Jalons</span>
                    <span className="project-stat-value">{stats.completedMilestones}/{stats.milestoneTotal}</span>
                    {stats.milestoneTotal > 0 && (
                      <div className="project-mini-bar">
                        <div className="project-mini-fill" style={{ width: `${milestoneProgress}%`, backgroundColor: '#10b981' }} />
                      </div>
                    )}
                  </div>
                  <div className="project-stat">
                    <span className="project-stat-label">Equipe</span>
                    <span className="project-stat-value">{stats.memberCount}</span>
                  </div>
                </div>

                <div className="project-card-footer">
                  {project.endDate && (
                    <span className={`project-deadline ${new Date(project.endDate) < new Date() ? 'text-overdue' : ''}`}>
                      📅 {formatDateRelative(project.endDate)}
                    </span>
                  )}
                  <span className="project-created">Cree {formatDateRelative(project.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
