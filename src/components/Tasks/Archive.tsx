import { Task, Tag } from '../../types/task';
import { formatDateRelative, getCategoryIcon, getPriorityIcon } from '../../utils/helpers';

interface ArchiveProps {
  tasks: Task[];
  tags: Tag[];
  onRestore: (id: string) => void;
  onDeletePermanently: (id: string) => void;
  onClearArchive: () => void;
}

export default function Archive({ tasks, tags, onRestore, onDeletePermanently, onClearArchive }: ArchiveProps) {
  const archived = tasks.filter((t) => t.archived);

  return (
    <div className="archive-view">
      <div className="archive-header">
        <h2>📦 Archive ({archived.length} taches)</h2>
        {archived.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={onClearArchive}>
            🗑 Vider l'archive
          </button>
        )}
      </div>

      {archived.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>Archive vide</h3>
          <p>Les taches terminees seront archivees ici.</p>
        </div>
      ) : (
        <div className="archive-list">
          {archived.map((task) => {
            const taskTags = tags.filter((t) => task.tags.includes(t.id));
            return (
              <div key={task.id} className="archive-item">
                <span className="archive-icon">{getCategoryIcon(task.category)}</span>
                <div className="archive-item-content">
                  <h4>{task.title}</h4>
                  <div className="archive-meta">
                    <span>{getPriorityIcon(task.priority)} {task.priority}</span>
                    <span>Terminee {task.completedAt ? formatDateRelative(task.completedAt) : ''}</span>
                    {taskTags.length > 0 && (
                      <div className="archive-tags">
                        {taskTags.map((tag) => (
                          <span key={tag.id} className="task-tag" style={{ backgroundColor: tag.color }}>{tag.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="archive-actions">
                  <button className="btn btn-sm btn-secondary" onClick={() => onRestore(task.id)}>
                    ↩ Restaurer
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => onDeletePermanently(task.id)}>
                    ✕ Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
