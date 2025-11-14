import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Dumbbell, TrendingUp, Video, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Exercise } from "@/database/exercises";
import { ExerciseRegistrationDialog } from "./ExerciseRegistrationDialog";
import AnimatedExercise from "./AnimatedExercise";
import { useStrengthProgress } from "@/hooks/useStrengthProgress";

interface InteractiveMuscleGroupProps {
  groupName: string;
  groupIcon: string;
  groupDescription: string;
  exercises: Exercise[];
  subdivisions?: string[];
}

export function InteractiveMuscleGroup({
  groupName,
  groupIcon,
  groupDescription,
  exercises,
  subdivisions = []
}: InteractiveMuscleGroupProps) {
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [showSubdivisions, setShowSubdivisions] = useState(false);
  
  const { progressData, calculateProgress } = useStrengthProgress();

  const handleExerciseClick = (exerciseId: number) => {
    setExpandedExercise(expandedExercise === exerciseId ? null : exerciseId);
  };

  const handleRegisterClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsRegistrationOpen(true);
  };

  const getExerciseProgress = (exerciseName: string) => {
    return progressData.find(p => p.exercise === exerciseName);
  };

  return (
    <div className="space-y-6">
      {/* Header do Grupo Muscular */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
                  <img 
                    src={groupIcon} 
                    alt={groupName}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <CardTitle className="text-3xl font-bold">{groupName}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {groupDescription}
              </CardDescription>
            </div>
            
            {subdivisions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubdivisions(!showSubdivisions)}
                className="gap-2"
              >
                Subdivisões
                {showSubdivisions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            )}
          </div>

          {/* Subdivisões */}
          {showSubdivisions && subdivisions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {subdivisions.map((subdivision) => (
                <Badge key={subdivision} variant="secondary" className="text-sm px-3 py-1">
                  {subdivision}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Lista de Exercícios */}
      <div className="space-y-4">
        {exercises.map((exercise) => {
          const isExpanded = expandedExercise === exercise.id;
          const progress = getExerciseProgress(exercise.name);
          const progressPercentage = progress 
            ? calculateProgress(progress.startWeight, progress.currentWeight, progress.targetWeight)
            : 0;

          return (
            <Card 
              key={exercise.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleExerciseClick(exercise.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Nome do Exercício */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🏋️‍♂️</span>
                      <CardTitle className="text-xl font-bold">
                        {exercise.name}
                      </CardTitle>
                    </div>

                    {/* Informações Básicas */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{exercise.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Dumbbell className="w-4 h-4" />
                        <span className="capitalize">{exercise.difficulty}</span>
                      </div>
                      {progress && (
                        <div className="flex items-center gap-1 text-primary">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-medium">
                            {progress.currentWeight}{progress.unit}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Descrição */}
                    <p className="text-foreground">
                      💪 {exercise.description}
                    </p>

                    {/* Séries e Reps */}
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium">
                        📊 {exercise.sets} séries × {exercise.reps}
                      </span>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegisterClick(exercise);
                        }}
                        className="gap-1"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Registrar
                      </Button>
                    </div>

                    {/* Barra de Progresso */}
                    {progress && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Progresso: {progressPercentage.toFixed(0)}%</span>
                          <span>Meta: {progress.targetWeight}{progress.unit}</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    )}
                  </div>

                  {/* Preview da Animação */}
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AnimatedExercise 
                      animation={exercise.animation}
                      size="small"
                    />
                  </div>
                </div>
              </CardHeader>

              {/* Conteúdo Expandido */}
              {isExpanded && (
                <CardContent className="pt-0 pb-4 border-t">
                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    {/* Instruções */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <span>📋</span>
                        Instruções:
                      </h4>
                      <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
                        {exercise.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Dicas */}
                    {exercise.tips && exercise.tips.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <span>💡</span>
                          Dicas:
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {exercise.tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Equipamentos */}
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <span>🏋️</span>
                        Equipamentos:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {exercise.equipment.map((eq) => (
                          <Badge key={eq} variant="outline" className="capitalize">
                            {eq}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Tempo de Descanso */}
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <span>⏱️</span>
                        Descanso entre séries:
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {exercise.restTime} segundos
                      </p>
                    </div>
                  </div>

                  {/* Botão de Vídeo */}
                  <Button
                    variant="outline"
                    className="w-full mt-4 gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Implementar abertura de vídeo
                    }}
                  >
                    <Video className="w-4 h-4" />
                    Assistir Demonstração
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Dialog de Registro */}
      {selectedExercise && (
        <ExerciseRegistrationDialog
          isOpen={isRegistrationOpen}
          onClose={() => setIsRegistrationOpen(false)}
          exercise={selectedExercise}
        />
      )}
    </div>
  );
}
