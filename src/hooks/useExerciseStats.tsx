import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/untyped";
import { useAuth } from "@/hooks/useAuth";

interface ExerciseFrequency {
  exercise_name: string;
  count: number;
}

interface ExerciseProgress {
  exercise_name: string;
  data: {
    date: string;
    weight: number;
  }[];
}

export const useExerciseStats = () => {
  const { user } = useAuth();
  const [topExercises, setTopExercises] = useState<ExerciseFrequency[]>([]);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get top 10 most performed exercises
      const { data: frequencyData } = await supabase
        .from('exercise_history')
        .select('exercise_name')
        .eq('user_id', user.id);

      if (frequencyData) {
        const frequency = frequencyData.reduce((acc: Record<string, number>, curr) => {
          acc[curr.exercise_name] = (acc[curr.exercise_name] || 0) + 1;
          return acc;
        }, {});

        const topExercisesArray = Object.entries(frequency)
          .map(([exercise_name, count]) => ({ exercise_name, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setTopExercises(topExercisesArray);

        // Get progress data for top 5 exercises with weight tracking
        const { data: progressData } = await supabase
          .from('exercise_history')
          .select('exercise_name, weight, performed_at')
          .eq('user_id', user.id)
          .in('exercise_name', topExercisesArray.slice(0, 5).map(e => e.exercise_name))
          .not('weight', 'is', null)
          .order('performed_at', { ascending: true });

        if (progressData) {
          const progressByExercise = progressData.reduce((acc: Record<string, { date: string; weight: number }[]>, curr) => {
            if (!acc[curr.exercise_name]) {
              acc[curr.exercise_name] = [];
            }
            acc[curr.exercise_name].push({
              date: new Date(curr.performed_at).toLocaleDateString('pt-BR'),
              weight: Number(curr.weight)
            });
            return acc;
          }, {} as Record<string, { date: string; weight: number }[]>);

          const progressArray: ExerciseProgress[] = [];
          for (const exercise_name in progressByExercise) {
            progressArray.push({
              exercise_name,
              data: progressByExercise[exercise_name]
            });
          }

          setExerciseProgress(progressArray);
        }
      }
    } catch (error) {
      console.error('Error loading exercise stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    topExercises,
    exerciseProgress,
    loading,
    refreshStats: loadStats
  };
};
