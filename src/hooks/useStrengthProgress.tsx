import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/untyped";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ExerciseProgress {
  exercise: string;
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  unit: string;
}

export const useStrengthProgress = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ExerciseProgress[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProgressData = async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from('progress_strength')
      .select('*')
      .eq('user_id', user.id)
      .order('exercise_name');

    if (data) {
      setProgressData(data.map(d => ({
        exercise: d.exercise_name,
        startWeight: Number(d.initial_weight),
        currentWeight: Number(d.current_weight),
        targetWeight: Number(d.target_weight),
        unit: d.unit
      })));
    }
    setLoading(false);
  };

  const updateExerciseProgress = async (
    exerciseName: string,
    newWeight: number
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from('progress_strength')
      .update({ current_weight: newWeight })
      .eq('user_id', user.id)
      .eq('exercise_name', exerciseName);

    if (error) {
      toast.error("Erro ao atualizar progresso");
      return;
    }

    toast.success("Progresso atualizado!");
    loadProgressData();
  };

  const addNewExercise = async (
    exerciseName: string,
    initialWeight: number,
    targetWeight: number,
    unit: string = 'kg'
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from('progress_strength')
      .insert({
        user_id: user.id,
        exercise_name: exerciseName,
        initial_weight: initialWeight,
        current_weight: initialWeight,
        target_weight: targetWeight,
        unit
      });

    if (error) {
      toast.error("Erro ao adicionar exercício");
      return;
    }

    toast.success("Exercício adicionado!");
    loadProgressData();
  };

  useEffect(() => {
    loadProgressData();
  }, [user]);

  const calculateProgress = (start: number, current: number, target: number) => {
    return Math.min(((current - start) / (target - start)) * 100, 100);
  };

  return {
    progressData,
    loading,
    updateExerciseProgress,
    addNewExercise,
    calculateProgress,
    refreshData: loadProgressData
  };
};
