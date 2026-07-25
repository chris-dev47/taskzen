import { Task } from '../../types/task';
import { getWorkloadByDay, getProductivityData, getTaskStats, formatDateRelative, getCategoryIcon, getPriorityIcon } from '../../utils/helpers';

interface DashboardProps {
  tasks: Task[];
  tags: { id: string; name: string; color: string }[];
  onNavigate: (view: string) => void;
  onStartFocus: (task: Task) => void;
}

export default function Dashboard({ tasks, tags, onNavigate, onStartFocus }: DashboardProps) {
  const stats = getTaskStats(tasks);
  const workload = getWorkloadByDay(tasks, 7);
  const productivity = getProductivityData(tasks, 14);
  const overdueTasks = tasks.filter((t) => !t.archived && t.status !== 'done' && new Date(t.dueDate) < new Date(new Date().toDateString()));
  const recentTasks = [...tasks].filter((t) => !t.archived).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  const nextDue = tasks.filter((t) => !t.archived && t.status !== 'done' && t.dueDate).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const categoryStats = tasks.filter((t) => !t.archived).reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tagStats = tags.map((tag) => ({
    ...tag,
    count: tasks.filter((t) => !t.archived && t.tags.includes(tag.id)).length,
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  const maxProductivity = Math.max(1, ...productivity.map((d) => Math.max(d.created, d.completed)));

  const categoryCompletionRate = Object.keys(categoryStats).map((cat) => {
    const catTasks = tasks.filter((t) => !t.archived && t.category === cat);
    const catDone = catTasks.filter((t) => t.status === 'done').length;
    return { category: cat, rate: catTasks.length > 0 ? Math.round((catDone / catTasks.length) * 100) : 0, total: catTasks.length };
  });

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card stat-card-total">
          <div className="stat-card-icon">📋</div>
          <div className="stat-card-info">
            <span className="stat-card-number">{stats.total}</span>
            <span className="stat-card-label">Taches totales</span>
          </div>
        </div>
        <div className="stat-card stat-card-progress">
          <div className="stat-card-icon">🚀</div>
          <div className="stat-card-info">
            <span className="stat-card-number">{stats.inProgress}</span>
            <span className="stat-card-label">En cours</span>
          </div>
        </div>
        <div className="stat-card stat-card-done">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-info">
            <span className="stat-card-number">{stats.done}</span>
            <span className="stat-card-label">Terminees</span>
          </div>
        </div>
        <div className="stat-card stat-card-overdue">
          <div className="stat-card-icon">⚠️</div>
          <div className="stat-card-info">
            <span className="stat-card-number">{stats.overdue}</span>
            <span className="stat-card-label">En retard</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Charge de travail par jour */}
        <div className="dashboard-card span-2">
          <h3>📅 Charge de travail (7 jours)</h3>
          <div className="workload-chart">
            {workload.map((day) => (
              <div key={day.date} className="workload-bar-col">
                <div className="workload-bar-wrapper">
                  <div className="workload-bar" style={{ height: `${Math.min(100, (day.count / 6) * 100)}%` }}>
                    {day.count > 0 && <span className="workload-count">{day.count}</span>}
                  </div>
                </div>
                <span className="workload-label">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Graphique evolution productivite */}
        <div className="dashboard-card span-2">
          <h3>📈 Evolution (14 jours)</h3>
          <div className="chart-container">
            <div className="chart-bars">
              {productivity.map((day, i) => (
                <div key={i} className="chart-bar-group">
                  <div className="chart-bar-pair">
                    <div className="chart-bar chart-bar-created" style={{ height: `${(day.created / maxProductivity) * 100}%` }} title={`${day.created} creees`} />
                    <div className="chart-bar chart-bar-completed" style={{ height: `${(day.completed / maxProductivity) * 100}%` }} title={`${day.completed} terminees`} />
                  </div>
                  <span className="chart-label">{new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'narrow' })}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <span><span className="legend-dot legend-created" /> Creees</span>
              <span><span className="legend-dot legend-completed" /> Terminees</span>
            </div>
          </div>
        </div>

        {/* Prochaine echeance */}
        {nextDue && (
          <div className="dashboard-card dashboard-card-highlight">
            <h3>⏰ Prochaine echeance</h3>
            <div className="next-due">
              <span className="next-due-icon">{getCategoryIcon(nextDue.category)}</span>
              <div>
                <strong>{nextDue.title}</strong>
                <p className={nextDue.dueDate && new Date(nextDue.dueDate) < new Date() ? 'text-overdue' : ''}>
                  {formatDateRelative(nextDue.dueDate)}
                </p>
              </div>
              <button className="btn btn-sm btn-primary" onClick={() => onStartFocus(nextDue)}>
                🎯 Focus
              </button>
            </div>
          </div>
        )}

        {/* Taches aujourd'hui */}
        <div className="dashboard-card">
          <h3>📌 Aujourd'hui</h3>
          <div className="today-summary">
            <p className="big-number">{stats.dueToday}</p>
            <p>tache{stats.dueToday !== 1 ? 's' : ''} a faire</p>
            {stats.dueTomorrow > 0 && (
              <p className="text-secondary">Demain : {stats.dueTomorrow} tache{stats.dueTomorrow !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>

        {/* Progression globale */}
        <div className="dashboard-card">
          <h3>🎯 Progression</h3>
          <div className="progress-section">
            <div className="progress-ring-container">
              <svg className="progress-ring" viewBox="0 0 120 120">
                <circle className="progress-ring-bg" cx="60" cy="60" r="50" />
                <circle className="progress-ring-fill" cx="60" cy="60" r="50"
                  strokeDasharray={`${stats.completionRate * 3.14} ${314 - stats.completionRate * 3.14}`}
                  transform="rotate(-90 60 60)" />
              </svg>
              <span className="progress-ring-text">{stats.completionRate}%</span>
            </div>
            {stats.totalSubtasks > 0 && (
              <p className="text-secondary">Sous-taches: {stats.completedSubtasks}/{stats.totalSubtasks}</p>
            )}
            {stats.totalTimeEstimate > 0 && (
              <p className="text-secondary">Temps: {stats.totalTimeSpent}/{stats.totalTimeEstimate}min</p>
            )}
          </div>
        </div>

        {/* Categories avec taux de completion */}
        <div className="dashboard-card">
          <h3>📊 Par categorie</h3>
          <div className="category-stats">
            {categoryCompletionRate.map((cat) => (
              <div key={cat.category} className="category-stat-row">
                <span>{getCategoryIcon(cat.category)}</span>
                <span className="cat-name">{cat.category}</span>
                <div className="cat-progress-bar">
                  <div className="cat-progress-fill" style={{ width: `${cat.rate}%` }} />
                </div>
                <span className="cat-rate">{cat.rate}%</span>
              </div>
            ))}
            {Object.keys(categoryStats).length === 0 && (
              <p className="empty-text">Aucune tache</p>
            )}
          </div>
        </div>

        {/* Taches en retard */}
        {overdueTasks.length > 0 && (
          <div className="dashboard-card dashboard-card-alert">
            <h3>🚨 En retard ({overdueTasks.length})</h3>
            <div className="task-quick-list">
              {overdueTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="quick-task-item">
                  <span>{getPriorityIcon(task.priority)}</span>
                  <span className="quick-task-title">{task.title}</span>
                  <span className="quick-task-date badge-overdue">{formatDateRelative(task.dueDate)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activite recente */}
        <div className="dashboard-card">
          <h3>🕐 Activite recente</h3>
          <div className="task-quick-list">
            {recentTasks.map((task) => (
              <div key={task.id} className="quick-task-item">
                <span className={`status-dot status-dot-${task.status}`} />
                <span className="quick-task-title">{task.title}</span>
                <span className="quick-task-time">{formatDateRelative(task.updatedAt)}</span>
              </div>
            ))}
            {recentTasks.length === 0 && <p className="empty-text">Aucune activite</p>}
          </div>
        </div>

        {/* Tags populaires */}
        {tagStats.length > 0 && (
          <div className="dashboard-card">
            <h3>🏷️ Etiquettes populaires</h3>
            <div className="tag-stats">
              {tagStats.map((tag) => (
                <div key={tag.id} className="tag-stat-item">
                  <span className="tag-dot" style={{ backgroundColor: tag.color }} />
                  <span>{tag.name}</span>
                  <span className="tag-count">{tag.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
