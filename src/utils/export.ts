import { Task } from '../types/task';
import { getCategoryLabel, getPriorityLabel, getStatusLabel, formatDate } from './helpers';

export const exportToJSON = (tasks: Task[]): void => {
  const data = JSON.stringify(tasks, null, 2);
  downloadFile(data, 'taskzen_export.json', 'application/json');
};

export const exportToCSV = (tasks: Task[]): void => {
  const headers = [
    'Titre',
    'Description',
    'Statut',
    'Priorite',
    'Categorie',
    'Echeance',
    'Tags',
    'Cree le',
    'Modifie le',
  ];

  const rows = tasks.map((t) => [
    t.title,
    t.description,
    getStatusLabel(t.status),
    getPriorityLabel(t.priority),
    getCategoryLabel(t.category),
    formatDate(t.dueDate),
    t.tags.join('; '),
    formatDate(t.createdAt),
    formatDate(t.updatedAt),
  ]);

  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
  downloadFile('\uFEFF' + csv, 'taskzen_export.csv', 'text/csv;charset=utf-8');
};

export const exportToText = (tasks: Task[]): void => {
  let text = '=== TaskZen - Export des taches ===\n\n';
  tasks.forEach((t, i) => {
    text += `#${i + 1} - ${t.title}\n`;
    text += `  Statut: ${getStatusLabel(t.status)} | Priorite: ${getPriorityLabel(t.priority)}\n`;
    text += `  Categorie: ${getCategoryLabel(t.category)}\n`;
    if (t.dueDate) text += `  Echeance: ${formatDate(t.dueDate)}\n`;
    if (t.description) text += `  Description: ${t.description}\n`;
    if (t.tags.length) text += `  Tags: ${t.tags.join(', ')}\n`;
    if (t.subtasks.length) {
      text += `  Sous-taches:\n`;
      t.subtasks.forEach((s) => {
        text += `    ${s.completed ? '[x]' : '[ ]'} ${s.title}\n`;
      });
    }
    text += '\n';
  });
  downloadFile(text, 'taskzen_export.txt', 'text/plain');
};

const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
