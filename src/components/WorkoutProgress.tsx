import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';

interface WorkoutProgressProps {
  totalExercises: number;
  completedExercises: number;
  currentExercise: number;
}

const WorkoutProgress: React.FC<WorkoutProgressProps> = ({
  totalExercises,
  completedExercises,
  currentExercise
}) => {
  const progress = (completedExercises / totalExercises) * 100;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Progresso do Treino</span>
        <span className="text-muted-foreground">
          {completedExercises} de {totalExercises} exercícios
        </span>
      </div>
      
      <Progress value={progress} className="h-3" />
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        Exercício atual: {currentExercise + 1}/{totalExercises}
      </div>
    </div>
  );
};

export default WorkoutProgress;
