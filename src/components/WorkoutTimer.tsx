import React, { useEffect, useState } from 'react';
import { Timer, Pause, Play } from 'lucide-react';

interface WorkoutTimerProps {
  initialTime: number;
  isResting: boolean;
  onComplete: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  initialTime,
  isResting,
  onComplete,
  isPaused,
  onTogglePause
}) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  useEffect(() => {
    setTimeRemaining(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (isPaused || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, isPaused, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeRemaining / initialTime) * 100;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90 w-48 h-48">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
            className={isResting ? 'text-orange-500' : 'text-primary'}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Timer className={`w-8 h-8 mb-2 ${isResting ? 'text-orange-500' : 'text-primary'}`} />
          <div className="text-4xl font-bold">{formatTime(timeRemaining)}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {isResting ? 'Descanso' : 'Executando'}
          </div>
        </div>
      </div>
      
      <button
        onClick={onTogglePause}
        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
      >
        {isPaused ? (
          <>
            <Play className="w-5 h-5" />
            Retomar
          </>
        ) : (
          <>
            <Pause className="w-5 h-5" />
            Pausar
          </>
        )}
      </button>
    </div>
  );
};

export default WorkoutTimer;
