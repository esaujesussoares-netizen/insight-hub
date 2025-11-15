import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Dumbbell, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface ExerciseRecommendation {
  exerciseName: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  restTime?: number;
  reason: string;
  difficulty?: string;
}

interface WorkoutPlan {
  recommendations: ExerciseRecommendation[];
  overallAdvice: string;
}

export const WorkoutRecommendations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const generateRecommendations = async () => {
    // Check authentication first
    if (!user || !session) {
      toast.error("You need to be logged in to get recommendations");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-workout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        if (error.message?.includes('Unauthorized')) {
          toast.error("Authentication error. Please log in again.");
          navigate("/login");
          return;
        }
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setWorkoutPlan(data);
      toast.success("Workout recommendations generated!");
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'advanced':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const handleStartExercise = (exercise: ExerciseRecommendation) => {
    // Create a temporary workout with just this exercise
    const tempWorkout = {
      id: 'ai-recommendation',
      name: `Treino AI: ${exercise.exerciseName}`,
      focus: exercise.muscleGroup,
      duration: '10-15 min',
      exercises: [{
        id: Date.now(),
        name: exercise.exerciseName,
        type: 'principal' as const,
        sets: exercise.sets,
        reps: exercise.reps,
        restTime: exercise.restTime || 60,
        animation: exercise.exerciseName.toLowerCase().replace(/\s+/g, '_'),
        instructions: [
          'Execute o movimento de forma controlada',
          'Mantenha a postura correta durante todo o exercício',
          'Respire adequadamente durante a execução',
          'Ajuste o peso conforme necessário'
        ],
        muscleGroup: exercise.muscleGroup,
        equipment: ['Academia']
      }]
    };
    
    navigate('/workout-session/ai-recommendation/single', {
      state: { workout: tempWorkout }
    });
  };

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Workout Recommendations</CardTitle>
          </div>
          <Button 
            onClick={generateRecommendations} 
            disabled={isLoading}
            size="sm"
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Get Recommendations
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          Personalized exercise suggestions based on your goals and workout history
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!workoutPlan && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Get Recommendations" to receive your personalized workout plan</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Analyzing your fitness profile...</p>
          </div>
        )}

        {workoutPlan && (
          <div className="space-y-6">
            {workoutPlan.overallAdvice && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm leading-relaxed">{workoutPlan.overallAdvice}</p>
              </div>
            )}

            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {workoutPlan.recommendations.map((exercise, index) => (
                  <Card 
                    key={index} 
                    className="border-border/40 cursor-pointer hover:bg-card/80 hover:border-primary/50 transition-all"
                    onClick={() => handleStartExercise(exercise)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{exercise.exerciseName}</CardTitle>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="border-primary/20">
                              {exercise.muscleGroup}
                            </Badge>
                            {exercise.difficulty && (
                              <Badge variant="outline" className={getDifficultyColor(exercise.difficulty)}>
                                {exercise.difficulty}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Dumbbell className="h-3 w-3" />
                            <span>{exercise.sets} sets × {exercise.reps}</span>
                          </div>
                          {exercise.restTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{exercise.restTime}s rest</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground italic">
                        {exercise.reason}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};