import { Task, Tag } from '../../types/task';
import { formatDateRelative, getCategoryIcon, getPriorityIcon } from '../../utils/helpers';

interface TrashProps {
  tasks: Task[];
  tags: Tag[];
  onRestore: (id: string) => void;
  onDeletePermanently: (id: string) => void;
  onEmptyTrash: () => void;
}

export default function Trash({ tasks, tags, onRestore, onDeletePermanently, onEmptyTrash }: TrashProps) {
  const trashed = tasks.filter((t) => t.deletedAt);

  return (
    <div className="trash-view">
      <div className="trash-header">
        <h2>🗑 Corbeille ({trashed.length} element{trashed.length !== 1 ? 's' : ''})</h2>
        {trashed.length > 0 && (
          <div className="trash-header-actions">
            <p className="text-secondary">Les elements sont supprimes definitivement apres 30 jours.</p>
            <button className="btn btn-danger btn-sm" onClick={onEmptyTrash}>Vider la corbeille</button>
          </div>
        )}
      </div>

      {trashed.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗑</div>
          <h3>Corbeille vide</h3>
          <p>Les taches supprimees apparaitront ici.</p>
        </div>
      ) : (
        <div className="trash-list">
          {trashed.map((task) => {
            const taskTags = tags.filter((t) => task.tags.includes(t.id));
            const deletedDate = task.deletedAt ? new Date(task.deletedAt) : new Date();
            const now = new Date();
            const daysSince = Math.floor((now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
            const daysLeft = Math.max(0, 30 - daysSince);

            return (
              <div key={task.id} className="trash-item">
                <span className="trash-icon">{getCategoryIcon(task.category)}</span>
                <div className="trash-item-content">
                  <h4>{task.title}</h4>
                  <div className="trash-meta">
                    <span>{getPriorityIcon(task.priority)} {task.priority}</span>
                    <span>Supprimee {formatDateRelative(task.deletedAt || '')}</span>
                    <span className={daysLeft <= 3 ? 'text-overdue' : ''}>
                      {daysLeft > 0 ? `${daysLeft}j restant${daysLeft > 1 ? 's' : ''}` : 'Suppression imminente'}
                    </span>
                    {taskTags.length > 0 && (
                      <div className="trash-tags">
                        {taskTags.map((tag) => (
                          <span key={tag.id} className="task-tag" style={{ backgroundColor: tag.color }}>{tag.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="trash-actions">
                  <button className="btn btn-sm btn-secondary" onClick={() => onRestore(task.id)}>↩ Restaurer</button>
                  <button className="btn btn-sm btn-danger" onClick={() => onDeletePermanently(task.id)}>✕ Definitif</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
