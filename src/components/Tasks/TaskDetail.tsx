import { useState, useRef } from 'react';
import { Task, Tag } from '../../types/task';
import { Project } from '../../types/project';
import { formatDateRelative, getCategoryLabel, getPriorityLabel, getStatusLabel, isOverdue, formatFileSize, getCategoryIcon, getPriorityIcon, getRecurrenceLabel } from '../../utils/helpers';

interface TaskDetailProps {
  task: Task;
  tags: Tag[];
  projects?: Project[];
  onClose: () => void;
  onEdit: (task: Task) => void;
  onToggleStatus: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onAddAttachment: (taskId: string, file: File) => void;
  onDeleteAttachment: (taskId: string, attachmentId: string) => void;
  onAddReminder: (taskId: string, reminder: Omit<import('../../types/task').Reminder, 'id' | 'triggered'>) => void;
  onDeleteReminder: (taskId: string, reminderId: string) => void;
}

export default function TaskDetail({
  task, tags, projects = [], onClose, onEdit, onToggleStatus, onToggleSubtask, onAddSubtask,
  onDeleteSubtask, onAddAttachment, onDeleteAttachment, onAddReminder, onDeleteReminder,
}: TaskDetailProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [newReminderMsg, setNewReminderMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const overdue = isOverdue(task.dueDate) && task.status !== 'done';
  const taskTags = tags.filter((t) => task.tags.includes(t.id));
  const project = projects.find((p) => p.id === task.projectId);
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalTimeEstimate = task.subtasks.reduce((a, s) => a + (s.timeEstimate || 0), 0);
  const totalTimeSpent = task.subtasks.reduce((a, s) => a + (s.timeSpent || 0), 0);

  return (
    <div className="task-detail">
      <div className="task-detail-header">
        <div className="task-detail-title-row">
          <button className={`task-checkbox task-checkbox--${task.status}`} onClick={() => onToggleStatus(task.id)}>
            {task.status === 'done' && <span>✓</span>}
            {task.status === 'in-progress' && <span className="spinner">⟳</span>}
          </button>
          <h2 className={task.status === 'done' ? 'task-title--done' : ''}>
            {getCategoryIcon(task.category)} {task.title}
          </h2>
        </div>
        <div className="task-detail-actions">
          <button className="btn btn-sm btn-secondary" onClick={() => onEdit(task)}>✏️ Modifier</button>
          <button className="btn btn-sm btn-secondary" onClick={onClose}>✕ Fermer</button>
        </div>
      </div>

      <div className="task-detail-body">
        <div className="detail-section">
          <div className="detail-badges">
            <span className={`badge badge-status status-${task.status}`}>{getStatusLabel(task.status)}</span>
            <span className={`badge badge-priority priority-${task.priority}`}>{getPriorityIcon(task.priority)} {getPriorityLabel(task.priority)}</span>
            <span className="badge badge-category">{getCategoryIcon(task.category)} {getCategoryLabel(task.category)}</span>
            {task.recurrence !== 'none' && <span className="badge badge-category">🔄 {getRecurrenceLabel(task.recurrence)}</span>}
            {project && (
              <span className="badge badge-project" style={{ backgroundColor: project.color }}>
                {project.icon} {project.name}
              </span>
            )}
            {overdue && <span className="badge badge-overdue">⚠️ En retard</span>}
          </div>
        </div>

        {task.description && (
          <div className="detail-section">
            <h4>Description</h4>
            <p className="detail-description">{task.description}</p>
          </div>
        )}

        <div className="detail-section">
          <h4>📅 Dates</h4>
          <div className="detail-dates">
            <div><span>Cree :</span> {formatDateRelative(task.createdAt)}</div>
            <div><span>Modifie :</span> {formatDateRelative(task.updatedAt)}</div>
            {task.dueDate && <div><span>Echeance :</span> <span className={overdue ? 'text-overdue' : ''}>{formatDateRelative(task.dueDate)}</span></div>}
            {task.completedAt && <div><span>Termine :</span> {formatDateRelative(task.completedAt)}</div>}
          </div>
        </div>

        {taskTags.length > 0 && (
          <div className="detail-section">
            <h4>🏷️ Etiquettes</h4>
            <div className="detail-tags">{taskTags.map((tag) => (
              <span key={tag.id} className="task-tag" style={{ backgroundColor: tag.color }}>{tag.name}</span>
            ))}</div>
          </div>
        )}

        <div className="detail-section">
          <h4>🧩 Sous-taches ({completedSubtasks}/{task.subtasks.length})</h4>
          {totalTimeEstimate > 0 && (
            <p className="text-secondary">⏱ {totalTimeSpent}/{totalTimeEstimate}min estimes</p>
          )}
          {task.subtasks.length > 0 && (
            <div className="detail-subtasks">
              {task.subtasks.map((s) => (
                <div key={s.id} className="subtask-row">
                  <button className={`subtask-check ${s.completed ? 'subtask-done' : ''}`} onClick={() => onToggleSubtask(task.id, s.id)}>
                    {s.completed ? '✓' : ''}
                  </button>
                  <span className={s.completed ? 'text-done' : ''}>{s.title}</span>
                  <div className="subtask-meta">
                    {s.timeEstimate > 0 && <span className="badge badge-subtasks">{s.timeEstimate}min</span>}
                    <span className={`badge priority-${s.priority}`}>{getPriorityIcon(s.priority)}</span>
                  </div>
                  <button className="btn-icon-sm" onClick={() => onDeleteSubtask(task.id, s.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
          <div className="input-with-btn">
            <input type="text" placeholder="Ajouter une sous-tache..." value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddSubtask(task.id, newSubtaskTitle), setNewSubtaskTitle(''))} />
            <button className="btn btn-sm btn-primary" onClick={() => { onAddSubtask(task.id, newSubtaskTitle); setNewSubtaskTitle(''); }}>+</button>
          </div>
        </div>

        <div className="detail-section">
          <h4>🔔 Rappels ({task.reminders.length})</h4>
          {task.reminders.length > 0 && (
            <div className="detail-reminders">
              {task.reminders.map((r) => (
                <div key={r.id} className="reminder-row">
                  <span>🔔 {formatDateRelative(r.date)} a {r.time}{r.message ? ` - ${r.message}` : ''}</span>
                  <button className="btn-icon-sm" onClick={() => onDeleteReminder(task.id, r.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
          <div className="reminder-add-form">
            <input type="date" value={newReminderDate} onChange={(e) => setNewReminderDate(e.target.value)} />
            <input type="time" value={newReminderTime} onChange={(e) => setNewReminderTime(e.target.value)} />
            <input type="text" placeholder="Message" value={newReminderMsg} onChange={(e) => setNewReminderMsg(e.target.value)} />
            <button className="btn btn-sm btn-primary" onClick={() => {
              if (newReminderDate && newReminderTime) { onAddReminder(task.id, { date: newReminderDate, time: newReminderTime, message: newReminderMsg }); setNewReminderDate(''); setNewReminderTime(''); setNewReminderMsg(''); }
            }}>+</button>
          </div>
        </div>

        <div className="detail-section">
          <h4>📎 Pieces jointes ({task.attachments.length})</h4>
          {task.attachments.length > 0 && (
            <div className="detail-attachments">
              {task.attachments.map((a) => (
                <div key={a.id} className="attachment-row">
                  <span>📎 {a.name} ({formatFileSize(a.size)})</span>
                  <div>
                    <a href={a.dataUrl} download={a.name} className="btn-icon-sm">⬇</a>
                    <button className="btn-icon-sm" onClick={() => onDeleteAttachment(task.id, a.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <label className="file-upload-label" onClick={() => fileInputRef.current?.click()}>
            📎 Ajouter des fichiers
          </label>
          <input type="file" multiple ref={fileInputRef} onChange={async (e) => {
            const files = e.target.files;
            if (!files) return;
            for (let i = 0; i < files.length; i++) await onAddAttachment(task.id, files[i]);
            e.target.value = '';
          }} style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  );
}
