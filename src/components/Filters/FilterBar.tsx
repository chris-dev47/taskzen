import { TaskFilters, TaskStatus, TaskPriority, TaskCategory, Tag } from '../../types/task';

interface FilterBarProps {
  filters: TaskFilters;
  tags: Tag[];
  onFilterChange: (filters: Partial<TaskFilters>) => void;
  resultCount: number;
}

export default function FilterBar({ filters, tags, onFilterChange, resultCount }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="search-row">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Rechercher par mot-cle, etiquette..." value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })} />
          {filters.search && <button className="search-clear" onClick={() => onFilterChange({ search: '' })}>✕</button>}
        </div>
        <div className="search-dates">
          <input type="date" value={filters.dateFrom} onChange={(e) => onFilterChange({ dateFrom: e.target.value })} placeholder="Du" title="Date de debut" />
          <span className="date-separator">-</span>
          <input type="date" value={filters.dateTo} onChange={(e) => onFilterChange({ dateTo: e.target.value })} placeholder="Au" title="Date de fin" />
        </div>
      </div>

      <div className="filter-group">
        <select value={filters.status} onChange={(e) => onFilterChange({ status: e.target.value as TaskStatus | 'all' })}>
          <option value="all">📋 Tous statuts</option>
          <option value="todo">⬜ A faire</option>
          <option value="in-progress">🔄 En cours</option>
          <option value="done">✅ Termine</option>
        </select>

        <select value={filters.priority} onChange={(e) => onFilterChange({ priority: e.target.value as TaskPriority | 'all' })}>
          <option value="all">🎯 Toutes priorites</option>
          <option value="high">🔴 Haute</option>
          <option value="medium">🟠 Moyenne</option>
          <option value="low">🟢 Basse</option>
        </select>

        <select value={filters.category} onChange={(e) => onFilterChange({ category: e.target.value as TaskCategory | 'all' })}>
          <option value="all">📁 Toutes categories</option>
          <option value="personal">🏠 Personnel</option>
          <option value="work">💼 Travail</option>
          <option value="health">💪 Sante</option>
          <option value="finance">💰 Finance</option>
          <option value="education">📚 Education</option>
          <option value="other">📌 Autre</option>
        </select>

        <select value={`${filters.sortBy}-${filters.sortOrder}`} onChange={(e) => {
          const [sortBy, sortOrder] = e.target.value.split('-');
          onFilterChange({ sortBy: sortBy as TaskFilters['sortBy'], sortOrder: sortOrder as TaskFilters['sortOrder'] });
        }}>
          <option value="order-asc">📌 Personnalise</option>
          <option value="dueDate-asc">📅 Echeance proche</option>
          <option value="dueDate-desc">📅 Echeance lointaine</option>
          <option value="priority-asc">🔴 Priorite haute</option>
          <option value="priority-desc">🟢 Priorite basse</option>
          <option value="createdAt-desc">🕐 Plus recents</option>
          <option value="createdAt-asc">🕐 Plus anciens</option>
          <option value="title-asc">🔤 Titre A-Z</option>
          <option value="title-desc">🔤 Titre Z-A</option>
        </select>
      </div>

      {filters.tags.length > 0 && (
        <div className="active-tag-filters">
          {filters.tags.map((tagId) => {
            const tag = tags.find((t) => t.id === tagId);
            if (!tag) return null;
            return (
              <span key={tagId} className="tag-filter-chip" style={{ backgroundColor: tag.color }}
                onClick={() => onFilterChange({ tags: filters.tags.filter((t) => t !== tagId) })}>
                {tag.name} ✕
              </span>
            );
          })}
          <button className="link-btn-sm" onClick={() => onFilterChange({ tags: [] })}>Tout effacer</button>
        </div>
      )}

      <div className="filter-result-count">
        {resultCount} tache{resultCount !== 1 ? 's' : ''}
        {(filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all' || filters.dateFrom || filters.dateTo) && (
          <span className="filter-active-badge"> (filtres actifs)</span>
        )}
      </div>
    </div>
  );
}
