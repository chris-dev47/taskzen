import { useState } from 'react';

interface DatabaseViewerProps {
  onClose: () => void;
}

interface DBEntry {
  key: string;
  value: any;
  size: string;
}

export default function DatabaseViewer({ onClose }: DatabaseViewerProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const entries: DBEntry[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('taskzen_')) {
      const raw = localStorage.getItem(key) || '';
      const bytes = new Blob([raw]).size;
      let size = '';
      if (bytes < 1024) size = `${bytes} o`;
      else if (bytes < 1024 * 1024) size = `${(bytes / 1024).toFixed(1)} Ko`;
      else size = `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;

      let parsed: any;
      try { parsed = JSON.parse(raw); } catch { parsed = raw; }

      entries.push({ key: key.replace('taskzen_', ''), value: parsed, size });
    }
  }

  const filtered = entries.filter((e) =>
    e.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selected = entries.find((e) => e.key === selectedKey);

  const getTotalSize = () => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('taskzen_')) {
        total += new Blob([localStorage.getItem(key) || '']).size;
      }
    }
    if (total < 1024) return `${total} o`;
    if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} Ko`;
    return `${(total / (1024 * 1024)).toFixed(1)} Mo`;
  };

  const getItemCount = (key: string) => {
    const entry = entries.find((e) => e.key === key);
    if (!entry) return 0;
    if (Array.isArray(entry.value)) return entry.value.length;
    if (typeof entry.value === 'object') return Object.keys(entry.value).length;
    return 1;
  };

  return (
    <div className="db-viewer-overlay">
      <div className="db-viewer-panel">
        <div className="db-viewer-header">
          <div>
            <h2>🗄 Base de donnees</h2>
            <p className="text-secondary">{entries.length} cles | {getTotalSize()} au total</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="db-viewer-search">
          <input
            type="text"
            placeholder="Rechercher une cle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="db-viewer-body">
          <div className="db-keys-list">
            {filtered.map((entry) => (
              <div
                key={entry.key}
                className={`db-key-item ${selectedKey === entry.key ? 'active' : ''}`}
                onClick={() => setSelectedKey(entry.key)}
              >
                <div className="db-key-info">
                  <span className="db-key-name">{entry.key}</span>
                  <span className="db-key-meta">
                    {getItemCount(entry.key)} element{getItemCount(entry.key) !== 1 ? 's' : ''} | {entry.size}
                  </span>
                </div>
                <span className="db-key-arrow">›</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="empty-text">Aucune cle trouvee</p>
            )}
          </div>

          <div className="db-detail">
            {selected ? (
              <>
                <div className="db-detail-header">
                  <h3>📝 {selected.key}</h3>
                  <span className="badge badge-category">{selected.size}</span>
                </div>
                <pre className="db-json">
                  {JSON.stringify(selected.value, null, 2)}
                </pre>
              </>
            ) : (
              <div className="db-detail-empty">
                <p>👆 Selectionnez une cle pour voir les donnees</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
