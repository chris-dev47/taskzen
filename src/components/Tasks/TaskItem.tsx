import { useState } from 'react';
import { Task, Tag } from '../../types/task';
import { Project } from '../../types/project';
import { formatDateRelative, isOverdue, getCategoryLabel, getPriorityLabel, getCategoryIcon, getPriorityIcon, getRecurrenceIcon } from '../../utils/helpers';

interface TaskItemProps {
  task: Task;
  tags: Tag[];
  projects?: Project[];
  onToggleStatus: (id: string) => void;
  onEdit: (task: Task) => void;
  onViewDetail: (task: Task) => void;
  onDelete: (id: string) => void;
  onStartFocus: (task: Task) => void;
  onArchive: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
  index: number;
}

export default function TaskItem({
  task, tags, projects = [], onToggleStatus, onEdit, onViewDetail, onDelete, onStartFocus, onArchive,
  onDragStart, onDragOver, onDrop, index,
}: TaskItemProps) {
  const overdue = isOverdue(task.dueDate) && task.status !== 'done';
  const taskTags = tags.filter((t) => task.tags.includes(t.id));
  const project = projects.find((p) => p.id === task.projectId);
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.touches[0].clientX - touchStart;
    if (Math.abs(diff) > 40) setSwipeDir(diff > 0 ? 'right' : 'left');
  };
  const handleTouchEnd = () => {
    if (swipeDir === 'right') onToggleStatus(task.id);
    if (swipeDir === 'left') onArchive(task.id);
    setTouchStart(null);
    setSwipeDir(null);
  };

  const priorityBg: Record<string, string> = {
    high: 'var(--priority-high-bg)', medium: 'var(--priority-medium-bg)', low: 'var(--priority-low-bg)',
  };

  return (
    <div
      className={`task-item task-item--${task.status} ${overdue ? 'task-item--overdue' : ''} ${swipeDir ? `swipe-${swipeDir}` : ''}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ backgroundColor: task.status !== 'done' ? priorityBg[task.priority] : undefined }}
    >
      <div className="task-drag-handle" title="Glisser pour reorganiser">⋮⋮</div>

      <button
        className={`task-checkbox task-checkbox--${task.status}`}
        onClick={(e) => { e.stopPropagation(); onToggleStatus(task.id); }}
        aria-label={`Changer le statut`}
      >
        {task.status === 'done' && <span>✓</span>}
        {task.status === 'in-progress' && <span className="spinner">⟳</span>}
      </button>

      <div className="task-content" onClick={() => onViewDetail(task)}>
        <h3 className={`task-title ${task.status === 'done' ? 'task-title--done' : ''}`}>
          {getCategoryIcon(task.category)} {task.title}
          {task.recurrence !== 'none' && <span className="recurrence-icon" title={task.recurrence}>{getRecurrenceIcon(task.recurrence)}</span>}
        </h3>
        {task.description && (
          <p className="task-description">{task.description.slice(0, 120)}{task.description.length > 120 ? '...' : ''}</p>
        )}
        <div className="task-meta">
          <span className={`badge badge-priority priority-${task.priority}`}>
            {getPriorityIcon(task.priority)} {getPriorityLabel(task.priority)}
          </span>
          <span className="badge badge-category">{getCategoryLabel(task.category)}</span>
          {task.dueDate && (
            <span className={`badge badge-date ${overdue ? 'badge-overdue' : ''}`}>
              📅 {formatDateRelative(task.dueDate)}
            </span>
          )}
          {task.subtasks.length > 0 && (
            <span className="badge badge-subtasks">☑ {completedSubtasks}/{task.subtasks.length}</span>
          )}
          {task.reminders.length > 0 && <span className="badge badge-reminders">🔔 {task.reminders.length}</span>}
          {task.attachments && task.attachments.length > 0 && (
            <span className="badge badge-attachments">📎 {task.attachments.length}</span>
          )}
          {project && (
            <span className="badge badge-project" style={{ backgroundColor: project.color }}>
              {project.icon} {project.name}
            </span>
          )}
        </div>
        {taskTags.length > 0 && (
          <div className="task-tags">
            {taskTags.map((tag) => (
              <span key={tag.id} className="task-tag" style={{ backgroundColor: tag.color }}>{tag.name}</span>
            ))}
          </div>
        )}
      </div>

      <div className="task-actions">
        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onStartFocus(task); }} title="Mode Focus">🎯</button>
        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onViewDetail(task); }} title="Details">👁</button>
        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onEdit(task); }} title="Modifier">✏️</button>
        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onArchive(task.id); }} title="Archiver">📦</button>
        <button className="btn-icon btn-icon-danger" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} title="Supprimer">🗑</button>
      </div>
    </div>
  );
}
