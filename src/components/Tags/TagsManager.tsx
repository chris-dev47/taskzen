import { useState } from 'react';
import { Tag, Task } from '../../types/task';

interface TagsProps {
  tags: Tag[];
  tasks: Task[];
  onAddTag: (name: string, color: string) => void;
  onUpdateTag: (id: string, data: Partial<Tag>) => void;
  onDeleteTag: (id: string) => void;
  onMergeTags: (sourceId: string, targetId: string) => void;
  onFilterByTag: (tagId: string) => void;
}

export default function TagsManager({ tags, tasks, onAddTag, onUpdateTag, onDeleteTag, onMergeTags, onFilterByTag }: TagsProps) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [mergeSource, setMergeSource] = useState('');
  const [mergeTarget, setMergeTarget] = useState('');
  const [showMerge, setShowMerge] = useState(false);

  const handleCreate = () => { if (!newName.trim()) return; onAddTag(newName.trim(), newColor); setNewName(''); setNewColor('#6366f1'); };
  const startEdit = (tag: Tag) => { setEditingId(tag.id); setEditName(tag.name); setEditColor(tag.color); };
  const saveEdit = () => { if (!editName.trim() || !editingId) return; onUpdateTag(editingId, { name: editName.trim(), color: editColor }); setEditingId(null); };
  const handleMerge = () => { if (mergeSource && mergeTarget && mergeSource !== mergeTarget) { onMergeTags(mergeSource, mergeTarget); setMergeSource(''); setMergeTarget(''); setShowMerge(false); } };

  // Suggestions based on task titles
  const suggestions = ['Urgent', 'Reunion', 'Appel', 'Email', 'Projet', 'Bug', 'Feature', 'Review', 'Deployment', 'Design'];
  const existingNames = tags.map((t) => t.name.toLowerCase());
  const newSuggestions = suggestions.filter((s) => !existingNames.includes(s.toLowerCase())).slice(0, 5);

  return (
    <div className="tags-manager">
      <h2>🏷️ Gestion des etiquettes</h2>

      <div className="tag-create-form">
        <input type="text" placeholder="Nom de l'etiquette" value={newName} onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
        <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="color-picker" />
        <button className="btn btn-primary" onClick={handleCreate}>Creer</button>
      </div>

      {newSuggestions.length > 0 && (
        <div className="tag-suggestions">
          <span className="text-secondary">Suggestions :</span>
          {newSuggestions.map((s) => (
            <button key={s} className="tag-chip tag-suggestion" onClick={() => { onAddTag(s, '#6b7280'); }}>{s}</button>
          ))}
        </div>
      )}

      <div className="merge-section">
        <button className="btn btn-sm btn-secondary" onClick={() => setShowMerge(!showMerge)}>
          🔗 Fusionner des etiquettes
        </button>
        {showMerge && (
          <div className="merge-form">
            <select value={mergeSource} onChange={(e) => setMergeSource(e.target.value)}>
              <option value="">Source (sera supprimee)</option>
              {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <span>→</span>
            <select value={mergeTarget} onChange={(e) => setMergeTarget(e.target.value)}>
              <option value="">Cible (sera gardee)</option>
              {tags.filter((t) => t.id !== mergeSource).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button className="btn btn-sm btn-primary" onClick={handleMerge} disabled={!mergeSource || !mergeTarget}>Fusionner</button>
          </div>
        )}
      </div>

      <div className="tags-grid">
        {tags.map((tag) => {
          const count = tasks.filter((t) => !t.archived && t.tags.includes(tag.id)).length;
          return (
            <div key={tag.id} className="tag-card">
              {editingId === tag.id ? (
                <div className="tag-edit-form">
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                  <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="color-picker" />
                  <div className="tag-edit-actions">
                    <button className="btn btn-sm btn-primary" onClick={saveEdit}>Sauver</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}>Annuler</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="tag-card-header">
                    <span className="tag-dot-lg" style={{ backgroundColor: tag.color }} />
                    <span className="tag-card-name">{tag.name}</span>
                    <span className="tag-count">{count} tache{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="tag-card-actions">
                    <button className="btn btn-sm btn-secondary" onClick={() => startEdit(tag)}>✏️</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => onFilterByTag(tag.id)}>🔍</button>
                    <button className="btn btn-sm btn-danger" onClick={() => onDeleteTag(tag.id)}>✕</button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
