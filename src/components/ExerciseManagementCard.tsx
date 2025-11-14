import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import EditExerciseDialog from './EditExerciseDialog';

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  difficulty: string | null;
  description: string | null;
  gif_url: string | null;
  equipment: any;
  sets: number | null;
  reps: string | null;
  rest_time: number | null;
  duration: string | null;
  instructions: any;
  tips: any;
}

interface ExerciseManagementCardProps {
  exercise: Exercise;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

const ExerciseManagementCard: React.FC<ExerciseManagementCardProps> = ({
  exercise,
  onUpdate,
  onDelete,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case 'iniciante':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'intermediário':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'avançado':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getMuscleGroupColor = (muscleGroup: string) => {
    const colors: Record<string, string> = {
      peito: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      costas: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      pernas: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      ombros: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
      bracos: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
      abdomen: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      gluteos: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      antebracos: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
      cardio: 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    return colors[muscleGroup] || 'bg-muted text-muted-foreground border-border';
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* GIF Preview */}
        <div className="relative h-48 bg-muted/30 flex items-center justify-center">
          {exercise.gif_url ? (
            <>
              <img
                src={exercise.gif_url}
                alt={exercise.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '';
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500/90 text-white border-0">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  GIF OK
                </Badge>
              </div>
            </>
          ) : (
            <div className="text-center p-4">
              <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">GIF não disponível</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{exercise.name}</h3>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className={getMuscleGroupColor(exercise.muscle_group)}>
              {exercise.muscle_group}
            </Badge>
            {exercise.difficulty && (
              <Badge variant="outline" className={getDifficultyColor(exercise.difficulty)}>
                {exercise.difficulty}
              </Badge>
            )}
          </div>

          {/* Description */}
          {exercise.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {exercise.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            {exercise.sets && <span>{exercise.sets} séries</span>}
            {exercise.reps && <span>{exercise.reps} reps</span>}
            {exercise.rest_time && <span>{exercise.rest_time}s desc</span>}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja deletar o exercício "{exercise.name}"? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(exercise.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Deletar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>

      <EditExerciseDialog
        exercise={exercise}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={onUpdate}
      />
    </>
  );
};

export default ExerciseManagementCard;
