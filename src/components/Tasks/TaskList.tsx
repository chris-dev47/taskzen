import { useState } from 'react';
import { Task, Tag } from '../../types/task';
import { Project } from '../../types/project';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  tags: Tag[];
  projects?: Project[];
  onToggleStatus: (id: string) => void;
  onEdit: (task: Task) => void;
  onViewDetail: (task: Task) => void;
  onDelete: (id: string) => void;
  onStartFocus: (task: Task) => void;
  onArchive: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

export default function TaskList({
  tasks, tags, projects = [], onToggleStatus, onEdit, onViewDetail, onDelete, onStartFocus, onArchive, onReorder,
}: TaskListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>Aucune tache</h3>
        <p>Commencez par creer votre premiere tache !</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id} task={task} tags={tags} projects={projects} index={index}
          onToggleStatus={onToggleStatus} onEdit={onEdit} onViewDetail={onViewDetail}
          onDelete={onDelete} onStartFocus={onStartFocus} onArchive={onArchive}
          onDragStart={(i) => setDragIndex(i)}
          onDragOver={(e, i) => {
            e.preventDefault();
            if (dragIndex !== null && dragIndex !== i) { onReorder(dragIndex, i); setDragIndex(i); }
          }}
          onDrop={() => setDragIndex(null)}
        />
      ))}
    </div>
  );
}
