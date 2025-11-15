import React, { useState } from 'react';
import { CheckCircle2, Info, Replace } from 'lucide-react';
import AnimatedExercise from './AnimatedExercise';
import { Exercise } from '@/data/workoutPrograms';
import { ExerciseAlternativesDialog } from './ExerciseAlternativesDialog';
import { Button } from './ui/button';

interface ExercisePlayerProps {
  exercise: Exercise;
  currentSet: number;
  isResting: boolean;
  onReplaceExercise?: (newExerciseName: string) => void;
}

const ExercisePlayer: React.FC<ExercisePlayerProps> = ({
  exercise,
  currentSet,
  isResting,
  onReplaceExercise
}) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const getExerciseTypeColor = (type: string) => {
    switch (type) {
      case 'principal':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'composto':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'auxiliar':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'isolado':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'finalizacao':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Exercício */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          {(() => {
            const typeLabel = (exercise?.type ?? 'principal');
            return (
              <>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getExerciseTypeColor(typeLabel)}`}>
                  {typeLabel.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {exercise.muscleGroup}
                </span>
              </>
            );
          })()}
        </div>
        
        <h2 className="text-3xl font-bold mb-2">{exercise.name}</h2>
        
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span>{exercise.sets} séries</span>
          <span>•</span>
          <span className="text-orange-500 font-semibold">{exercise.reps} reps</span>
          <span>•</span>
          <span>{exercise.restTime}s descanso</span>
        </div>
      </div>

      {/* Animação do Exercício */}
      <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
        {isResting ? (
          <div className="text-center">
            <div className="text-6xl mb-4">😮‍💨</div>
            <div className="text-2xl font-bold text-orange-500">Descansando...</div>
            <div className="text-sm text-muted-foreground mt-2">
              Prepare-se para a próxima série
            </div>
          </div>
        ) : (
          <AnimatedExercise animation={exercise.animation} size="large" />
        )}
      </div>

      {/* Contador de Séries */}
      <div className="flex items-center justify-center gap-3">
        {Array.from({ length: exercise.sets }).map((_, index) => (
          <div
            key={index}
            className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold border-2 transition-all ${
              index < currentSet
                ? 'bg-green-500 text-white border-green-500'
                : index === currentSet
                ? 'bg-primary text-primary-foreground border-primary scale-110'
                : 'bg-muted text-muted-foreground border-border'
            }`}
          >
            {index < currentSet ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              index + 1
            )}
          </div>
        ))}
      </div>

      {/* Botão de Alternativas */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAlternatives(true)}
          className="gap-2"
        >
          <Replace className="w-4 h-4" />
          Não consegue fazer? Veja alternativas
        </Button>
      </div>

      {/* Instruções */}
      <div className="bg-card rounded-xl border p-4">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            <span className="font-semibold">Como Executar</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {showInstructions ? 'Ocultar' : 'Ver instruções'}
          </span>
        </button>
        
        {showInstructions && (
          <div className="mt-4 space-y-2">
            {exercise.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-muted-foreground">{instruction}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Equipamento Necessário */}
      <div className="flex flex-wrap gap-2 justify-center">
        {exercise.equipment.map((item, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>

      {/* Dialog de Alternativas */}
      <ExerciseAlternativesDialog
        open={showAlternatives}
        onOpenChange={setShowAlternatives}
        exerciseName={exercise.name}
        muscleGroup={exercise.muscleGroup}
        onSelectAlternative={onReplaceExercise}
      />
    </div>
  );
};

export default ExercisePlayer;
