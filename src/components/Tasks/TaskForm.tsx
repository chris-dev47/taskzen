import { useState } from 'react';
import { Task, TaskFormData, TaskStatus, TaskPriority, TaskCategory, Tag, Recurrence } from '../../types/task';
import { Project } from '../../types/project';
import { storage } from '../../utils/storage';
import { getRecurrenceLabel } from '../../utils/helpers';

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  onCancel?: () => void;
  initialData?: Task;
  isEditing?: boolean;
  tags: Tag[];
  onCreateTag: (name: string, color: string) => void;
  projects?: Project[];
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'A faire' }, { value: 'in-progress', label: 'En cours' }, { value: 'done', label: 'Termine' },
];
const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: '🟢 Basse' }, { value: 'medium', label: '🟠 Moyenne' }, { value: 'high', label: '🔴 Haute' },
];
const CATEGORY_OPTIONS: { value: TaskCategory; label: string }[] = [
  { value: 'personal', label: '🏠 Personnel' }, { value: 'work', label: '💼 Travail' },
  { value: 'health', label: '💪 Sante' }, { value: 'finance', label: '💰 Finance' },
  { value: 'education', label: '📚 Education' }, { value: 'other', label: '📌 Autre' },
];
const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: 'none', label: 'Aucune' }, { value: 'daily', label: '🔄 Quotidienne' },
  { value: 'weekly', label: '📅 Hebdomadaire' }, { value: 'monthly', label: '📆 Mensuelle' },
  { value: 'yearly', label: '🗓️ Annuelle' },
];

export default function TaskForm({ onSubmit, onCancel, initialData, isEditing = false, tags, onCreateTag, projects = [] }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || 'todo');
  const [priority, setPriority] = useState<TaskPriority>(initialData?.priority || 'medium');
  const [category, setCategory] = useState<TaskCategory>(initialData?.category || 'personal');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [recurrence, setRecurrence] = useState<Recurrence>(initialData?.recurrence || 'none');
  const [projectId, setProjectId] = useState(initialData?.projectId || '');
  const [subtasks, setSubtasks] = useState(initialData?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskPriority, setNewSubtaskPriority] = useState<TaskPriority>('medium');
  const [newSubtaskTime, setNewSubtaskTime] = useState(0);
  const [reminders, setReminders] = useState(initialData?.reminders?.map((r) => ({ date: r.date, time: r.time, message: r.message })) || []);
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [newReminderMsg, setNewReminderMsg] = useState('');
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Le titre est requis';
    if (title.length > 100) e.title = 'Maximum 100 caracteres';
    if (dueDate && new Date(dueDate) < new Date(new Date().toDateString()) && status !== 'done') {
      e.dueDate = 'Attention : date dans le passe';
    }
    setErrors(e);
    return !e.title;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: title.trim(), description: description.trim(), status, priority, category, dueDate,
      projectId: projectId || undefined, tags: selectedTags, recurrence, deletedAt: null, reminders: reminders.map((r, i) => ({
        id: initialData?.reminders?.[i]?.id || storage.generateId(), ...r, triggered: initialData?.reminders?.[i]?.triggered || false,
      })),
    });
  };

  const toggleTag = (tagId: string) => setSelectedTags((p) => p.includes(tagId) ? p.filter((id) => id !== tagId) : [...p, tagId]);
  const handleCreateTag = () => { if (newTagName.trim()) { onCreateTag(newTagName.trim(), newTagColor); setNewTagName(''); setShowNewTag(false); } };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((p) => [...p, { id: storage.generateId(), title: newSubtaskTitle.trim(), completed: false, priority: newSubtaskPriority, timeEstimate: newSubtaskTime, timeSpent: 0 }]);
    setNewSubtaskTitle(''); setNewSubtaskPriority('medium'); setNewSubtaskTime(0);
  };

  const addReminder = () => {
    if (!newReminderDate || !newReminderTime) return;
    setReminders((p) => [...p, { date: newReminderDate, time: newReminderTime, message: newReminderMsg }]);
    setNewReminderDate(''); setNewReminderTime(''); setNewReminderMsg('');
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2 className="form-title">{isEditing ? '✏️ Modifier la tache' : '➕ Nouvelle tache'}</h2>

      <div className="form-group">
        <label>Titre *</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Que devez-vous faire ?" className={errors.title ? 'input-error' : ''} autoFocus />
        {errors.title && <span className="error-text">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ajoutez des details..." rows={3} />
      </div>

      <div className="form-row-3">
        <div className="form-group">
          <label>Statut</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Priorite</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
            {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Categorie</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)}>
            {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row-2">
        <div className="form-group">
          <label>Echeance</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          {errors.dueDate && <span className="error-text warning">{errors.dueDate}</span>}
        </div>
        <div className="form-group">
          <label>🔄 Repetition</label>
          <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as Recurrence)}>
            {RECURRENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {projects.length > 0 && (
        <div className="form-group">
          <label>📁 Projet</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Aucun projet</option>
            {projects.filter((p) => p.status === 'active').map((p) => (
              <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label>🏷️ Etiquettes</label>
        <div className="tags-selector">
          {tags.map((tag) => (
            <button key={tag.id} type="button" className={`tag-chip ${selectedTags.includes(tag.id) ? 'tag-selected' : ''}`}
              style={{ borderColor: tag.color, backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent' }}
              onClick={() => toggleTag(tag.id)}>{tag.name}</button>
          ))}
          <button type="button" className="tag-chip tag-add" onClick={() => setShowNewTag(!showNewTag)}>+ Ajouter</button>
        </div>
        {showNewTag && (
          <div className="new-tag-form">
            <input type="text" placeholder="Nom" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
            <input type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} className="color-picker" />
            <button type="button" className="btn btn-sm btn-primary" onClick={handleCreateTag}>Creer</button>
          </div>
        )}
      </div>

      <div className="form-group">
        <label>🧩 Sous-taches</label>
        {subtasks.length > 0 && (
          <div className="subtask-list">
            {subtasks.map((s) => (
              <div key={s.id} className="subtask-item">
                <span>{s.completed ? '✅' : '⬜'} {s.title}</span>
                <div className="subtask-meta">
                  {s.timeEstimate > 0 && <span className="badge badge-subtasks">{s.timeEstimate}min</span>}
                  <span className={`badge priority-${s.priority}`}>{s.priority}</span>
                  <button type="button" className="btn-icon-sm" onClick={() => setSubtasks((p) => p.filter((x) => x.id !== s.id))}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="subtask-add-form">
          <input type="text" placeholder="Titre de la sous-tache" value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())} />
          <select value={newSubtaskPriority} onChange={(e) => setNewSubtaskPriority(e.target.value as TaskPriority)}>
            {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input type="number" placeholder="min" min={0} value={newSubtaskTime || ''} onChange={(e) => setNewSubtaskTime(Number(e.target.value))} className="time-input" />
          <button type="button" className="btn btn-sm btn-primary" onClick={addSubtask}>+</button>
        </div>
      </div>

      <div className="form-group">
        <label>🔔 Rappels</label>
        {reminders.length > 0 && (
          <div className="reminder-list">
            {reminders.map((r, i) => (
              <div key={i} className="reminder-item">
                <span>🔔 {r.date} a {r.time}{r.message ? ` - ${r.message}` : ''}</span>
                <button type="button" className="btn-icon-sm" onClick={() => setReminders((p) => p.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
          </div>
        )}
        <div className="reminder-form">
          <input type="date" value={newReminderDate} onChange={(e) => setNewReminderDate(e.target.value)} />
          <input type="time" value={newReminderTime} onChange={(e) => setNewReminderTime(e.target.value)} />
          <input type="text" placeholder="Message" value={newReminderMsg} onChange={(e) => setNewReminderMsg(e.target.value)} />
          <button type="button" className="btn btn-sm btn-primary" onClick={addReminder}>+</button>
        </div>
      </div>

      <div className="form-actions">
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}>Annuler</button>}
        <button type="submit" className="btn btn-primary">{isEditing ? 'Mettre a jour' : 'Ajouter la tache'}</button>
      </div>
    </form>
  );
}
