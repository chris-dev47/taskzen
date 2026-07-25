import { useState } from 'react';
import { Project, ProjectFormData, ProjectStatus } from '../../types/project';

interface Props {
  onSubmit: (data: ProjectFormData) => void;
  onCancel?: () => void;
  initialData?: Project;
  isEditing?: boolean;
}

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6b7280', '#f97316'];
const ICONS = ['📁', '🚀', '💻', '🎨', '📊', '🔧', '🎯', '🌟', '📱', '🤖', '🛠', '📋', '💡', '🔬', '🎮', '🏠', '💼', '🎓', '🏥', '🛒'];
const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: '🟢 Actif' },
  { value: 'completed', label: '✅ Termine' },
  { value: 'archived', label: '📦 Archive' },
];

export default function ProjectForm({ onSubmit, onCancel, initialData, isEditing = false }: Props) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<ProjectStatus>(initialData?.status || 'active');
  const [color, setColor] = useState(initialData?.color || '#6366f1');
  const [icon, setIcon] = useState(initialData?.icon || '📁');
  const [startDate, setStartDate] = useState(initialData?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [budget, setBudget] = useState(initialData?.budget || 0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Le nom est requis';
    if (name.length > 80) e.name = 'Maximum 80 caracteres';
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) e.endDate = "La date de fin doit etre apres le debut";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: name.trim(), description: description.trim(), status, color, icon,
      startDate, endDate, budget,
      memberIds: initialData?.memberIds || [],
      ownerId: initialData?.ownerId || '',
    });
  };

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <h2 className="form-title">{isEditing ? '✏️ Modifier le projet' : '➕ Nouveau projet'}</h2>

      <div className="form-group">
        <label>Nom du projet *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Refonte du site web" className={errors.name ? 'input-error' : ''} autoFocus />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Decrivez le projet..." rows={3} />
      </div>

      <div className="form-group">
        <label>Icone</label>
        <div className="icon-picker">
          {ICONS.map((i) => (
            <button key={i} type="button" className={`icon-option ${icon === i ? 'icon-selected' : ''}`}
              onClick={() => setIcon(i)}>{i}</button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Couleur</label>
        <div className="color-picker-row">
          {COLORS.map((c) => (
            <button key={c} type="button" className={`color-dot ${color === c ? 'color-selected' : ''}`}
              style={{ backgroundColor: c }} onClick={() => setColor(c)} />
          ))}
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="color-picker-inline" />
        </div>
      </div>

      {isEditing && (
        <div className="form-group">
          <label>Statut</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )}

      <div className="form-row-2">
        <div className="form-group">
          <label>Date de debut</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Date de fin (echeance)</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          {errors.endDate && <span className="error-text">{errors.endDate}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Budget (optionnel)</label>
        <input type="number" value={budget || ''} onChange={(e) => setBudget(Number(e.target.value))}
          placeholder="0" min={0} step={100} />
      </div>

      <div className="form-actions">
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}>Annuler</button>}
        <button type="submit" className="btn btn-primary">{isEditing ? 'Mettre a jour' : 'Creer le projet'}</button>
      </div>
    </form>
  );
}
