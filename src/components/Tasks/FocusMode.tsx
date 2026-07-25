import { useState, useEffect, useRef, useCallback } from 'react';
import { Task } from '../../types/task';
import { formatPomodoroTime } from '../../utils/helpers';

interface FocusModeProps {
  task: Task;
  onClose: () => void;
  onToggleStatus: (id: string) => void;
  onAddTimeSpent: (taskId: string, subtaskId: string, minutes: number) => void;
}

type TimerMode = 'focus' | 'short-break' | 'long-break';

const DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  'short-break': 5 * 60,
  'long-break': 15 * 60,
};

const MODE_LABELS: Record<TimerMode, string> = {
  focus: '🎯 Focus',
  'short-break': '☕ Pause courte',
  'long-break': '🧘 Pause longue',
};

export default function FocusMode({ task, onClose, onToggleStatus, onAddTimeSpent }: FocusModeProps) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            if (mode === 'focus') {
              setPomodoroCount((c) => c + 1);
              setTotalFocusTime((t) => t + DURATIONS.focus);
              if ((pomodoroCount + 1) % 4 === 0) {
                setMode('long-break');
                return DURATIONS['long-break'];
              } else {
                setMode('short-break');
                return DURATIONS['short-break'];
              }
            } else {
              setMode('focus');
              return DURATIONS.focus;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, pomodoroCount]);

  const toggleTimer = () => setIsRunning((p) => !p);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(DURATIONS[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
  };

  const progress = ((DURATIONS[mode] - timeLeft) / DURATIONS[mode]) * 100;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="focus-mode">
      <div className="focus-header">
        <button className="btn btn-secondary" onClick={onClose}>← Retour</button>
        <h2>Mode Focus</h2>
        <div />
      </div>

      <div className="focus-task-info">
        <h3>{task.title}</h3>
        {task.description && <p>{task.description.slice(0, 200)}</p>}
      </div>

      <div className="focus-timer-modes">
        {(Object.keys(DURATIONS) as TimerMode[]).map((m) => (
          <button key={m} className={`focus-mode-btn ${mode === m ? 'active' : ''}`} onClick={() => switchMode(m)}>
            {m === 'focus' ? '🎯 Focus' : m === 'short-break' ? '☕ Pause' : '🧘 Longue pause'}
          </button>
        ))}
      </div>

      <div className="focus-timer-container">
        <svg className="focus-timer-ring" viewBox="0 0 200 200">
          <circle className="focus-ring-bg" cx="100" cy="100" r="90" />
          <circle className="focus-ring-fill" cx="100" cy="100" r="90"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 100 100)" />
        </svg>
        <div className="focus-timer-text">
          <span className="focus-time">{formatPomodoroTime(timeLeft)}</span>
          <span className="focus-mode-label">{mode === 'focus' ? 'Concentration' : 'Repos'}</span>
        </div>
      </div>

      <div className="focus-controls">
        <button className="btn btn-primary btn-lg" onClick={toggleTimer}>
          {isRunning ? '⏸ Pause' : '▶️ Demarrer'}
        </button>
        <button className="btn btn-secondary" onClick={resetTimer}>🔄 Reset</button>
      </div>

      <div className="focus-stats">
        <div className="focus-stat">
          <span className="focus-stat-num">{pomodoroCount}</span>
          <span className="focus-stat-label">Pomodoros</span>
        </div>
        <div className="focus-stat">
          <span className="focus-stat-num">{formatPomodoroTime(totalFocusTime)}</span>
          <span className="focus-stat-label">Temps total</span>
        </div>
      </div>

      {task.subtasks.length > 0 && (
        <div className="focus-subtasks">
          <h4>Sous-taches</h4>
          {task.subtasks.map((s) => (
            <div key={s.id} className={`focus-subtask ${s.completed ? 'done' : ''}`}>
              <span>{s.completed ? '✅' : '⬜'} {s.title}</span>
              {s.timeEstimate > 0 && <span className="text-secondary">{s.timeEstimate}min est.</span>}
            </div>
          ))}
        </div>
      )}

      <div className="focus-complete">
        <button className="btn btn-success btn-full" onClick={() => { onToggleStatus(task.id); onClose(); }}>
          ✅ Marquer comme terminee
        </button>
      </div>
    </div>
  );
}
