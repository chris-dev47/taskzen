import { useState, useEffect, useRef } from 'react';

interface BreathingExerciseProps {
  onClose: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale';

const PHASES: { phase: Phase; duration: number; label: string }[] = [
  { phase: 'inhale', duration: 4, label: 'Inspirez' },
  { phase: 'hold', duration: 4, label: 'Retenez' },
  { phase: 'exhale', duration: 6, label: 'Expirez' },
];

export default function BreathingExercise({ onClose }: BreathingExerciseProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PHASES[0].duration);
  const [cycles, setCycles] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            const nextPhase = (currentPhase + 1) % PHASES.length;
            if (nextPhase === 0) setCycles((c) => c + 1);
            setCurrentPhase(nextPhase);
            setTotalTime((t) => t + 1);
            return PHASES[nextPhase].duration;
          }
          setTotalTime((t) => t + 1);
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, currentPhase]);

  const phase = PHASES[currentPhase];
  const progress = ((phase.duration - timeLeft) / phase.duration) * 100;

  const circleScale = phase.phase === 'inhale' ? 1.3 : phase.phase === 'hold' ? 1.3 : 1;

  return (
    <div className="breathing-overlay">
      <div className="breathing-panel">
        <button className="breathing-close" onClick={onClose}>✕</button>
        <h2>🧘 Exercice de respiration</h2>
        <p className="text-secondary">4-4-6 : Inspirez, Retenez, Expirez</p>

        <div className="breathing-circle-container">
          <div
            className={`breathing-circle breathing-${phase.phase}`}
            style={{ transform: `scale(${circleScale})` }}
          >
            <span className="breathing-phase-label">{phase.label}</span>
            <span className="breathing-time">{timeLeft}</span>
          </div>
          <svg className="breathing-progress-ring" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" strokeDasharray={`${progress * 5.65} ${565 - progress * 5.65}`} />
          </svg>
        </div>

        <div className="breathing-controls">
          {!isRunning ? (
            <button className="btn btn-primary btn-lg" onClick={() => setIsRunning(true)}>
              ▶️ Commencer
            </button>
          ) : (
            <button className="btn btn-secondary btn-lg" onClick={() => setIsRunning(false)}>
              ⏸ Pause
            </button>
          )}
        </div>

        <div className="breathing-stats">
          <div className="breathing-stat">
            <span>{cycles}</span>
            <span className="text-secondary">Cycles</span>
          </div>
          <div className="breathing-stat">
            <span>{Math.floor(totalTime / 60)}min</span>
            <span className="text-secondary">Temps total</span>
          </div>
        </div>

        {cycles >= 3 && (
          <div className="breathing-message">
            <p>🎯 Bravo ! {cycles} cycles effectues. Vous devriez vous sentir plus calme.</p>
          </div>
        )}
      </div>
    </div>
  );
}
