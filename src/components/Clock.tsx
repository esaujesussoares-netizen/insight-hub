import { useState, useEffect } from 'react';
import { Clock as ClockIcon } from 'lucide-react';

export const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
      <ClockIcon className="w-6 h-6 text-primary" />
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold tabular-nums">{hours}</span>
        <span className="text-2xl text-muted-foreground animate-pulse">:</span>
        <span className="text-3xl font-bold tabular-nums">{minutes}</span>
        <span className="text-2xl text-muted-foreground animate-pulse">:</span>
        <span className="text-3xl font-bold tabular-nums">{seconds}</span>
      </div>
    </div>
  );
};
