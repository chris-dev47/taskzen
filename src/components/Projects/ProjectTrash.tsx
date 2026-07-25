import { Project, Member } from '../../types/project';
import { Task } from '../../types/task';
import { formatDateRelative } from '../../utils/helpers';

interface Props {
  projects: Project[];
  members: Member[];
  tasks: Task[];
  onRestore: (id: string) => void;
  onDeletePermanently: (id: string) => void;
  onEmptyTrash: () => void;
  onBack: () => void;
}

export default function ProjectTrash({ projects, members, tasks, onRestore, onDeletePermanently, onEmptyTrash, onBack }: Props) {
  const trashed = projects.filter((p) => p.deletedAt);

  const getProjectStats = (project: Project) => {
    const projectTasks = tasks.filter((t) => t.projectId === project.id);
    const memberCount = members.filter((m) => m.projectId === project.id).length;
    return { taskCount: projectTasks.length, memberCount };
  };

  return (
    <div className="project-trash-view">
      <div className="project-trash-header">
        <div className="project-trash-top">
          <button className="btn btn-secondary btn-sm" onClick={onBack}>← Retour aux projets</button>
          {trashed.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={onEmptyTrash}>🗑 Vider la corbeille</button>
          )}
        </div>
        <h2>🗑 Corbeille projets ({trashed.length} element{trashed.length !== 1 ? 's' : ''})</h2>
        <p className="text-secondary">Les projets supprimes sont conserves 30 jours avant suppression automatique.</p>
      </div>

      {trashed.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗑</div>
          <h3>Corbeille vide</h3>
          <p>Les projets supprimes apparaitront ici.</p>
        </div>
      ) : (
        <div className="project-trash-list">
          {trashed.map((project) => {
            const stats = getProjectStats(project);
            const deletedDate = project.deletedAt ? new Date(project.deletedAt) : new Date();
            const now = new Date();
            const daysSince = Math.floor((now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
            const daysLeft = Math.max(0, 30 - daysSince);

            return (
              <div key={project.id} className="project-trash-item" style={{ borderLeftColor: project.color }}>
                <span className="project-trash-icon">{project.icon}</span>
                <div className="project-trash-info">
                  <h4>{project.name}</h4>
                  {project.description && <p className="text-secondary">{project.description.slice(0, 80)}{project.description.length > 80 ? '...' : ''}</p>}
                  <div className="project-trash-meta">
                    <span>{stats.taskCount} tache{stats.taskCount !== 1 ? 's' : ''}</span>
                    <span>{stats.memberCount} membre{stats.memberCount !== 1 ? 's' : ''}</span>
                    <span>Supprime {formatDateRelative(project.deletedAt || '')}</span>
                    <span className={daysLeft <= 3 ? 'text-overdue' : ''}>
                      {daysLeft > 0 ? `${daysLeft}j restant${daysLeft > 1 ? 's' : ''}` : 'Suppression imminente'}
                    </span>
                  </div>
                </div>
                <div className="project-trash-actions">
                  <button className="btn btn-sm btn-secondary" onClick={() => onRestore(project.id)}>↩ Restaurer</button>
                  <button className="btn btn-sm btn-danger" onClick={() => onDeletePermanently(project.id)}>✕ Definitif</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
