import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/untyped";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface WeightGoal {
  id: string;
  goal_type: 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'gain_muscle';
  start_weight: number;
  target_weight: number;
  current_weight: number;
  start_date: string;
  target_date?: string;
  completed: boolean;
  completed_at?: string;
  milestones: any[];
  notifications_enabled: boolean;
}

export const useWeightGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<WeightGoal[]>([]);
  const [activeGoal, setActiveGoal] = useState<WeightGoal | null>(null);
  const [loading, setLoading] = useState(false);

  const loadGoals = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('weight_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading goals:', error);
    } else if (data) {
      setGoals(data);
      const active = data.find(g => !g.completed);
      setActiveGoal(active || null);
    }
    setLoading(false);
  };

  const createGoal = async (goal: {
    goal_type: WeightGoal['goal_type'];
    start_weight: number;
    target_weight: number;
    target_date?: string;
  }) => {
    if (!user) return;

    const { error } = await supabase
      .from('weight_goals')
      .insert({
        user_id: user.id,
        ...goal,
        current_weight: goal.start_weight
      });

    if (error) {
      toast.error("Erro ao criar meta");
      console.error('Error creating goal:', error);
      return;
    }

    toast.success("Meta criada com sucesso!");
    loadGoals();
  };

  const updateGoalProgress = async (goalId: string, currentWeight: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    // Verificar se atingiu a meta
    const goalReached = 
      (goal.goal_type === 'lose_weight' && currentWeight <= goal.target_weight) ||
      (goal.goal_type === 'gain_weight' && currentWeight >= goal.target_weight) ||
      (goal.goal_type === 'gain_muscle' && currentWeight >= goal.target_weight);

    const updateData: any = {
      current_weight: currentWeight
    };

    if (goalReached) {
      updateData.completed = true;
      updateData.completed_at = new Date().toISOString();
      toast.success("🎉 Parabéns! Você atingiu sua meta!");
    }

    // Verificar marcos importantes (5kg de diferença)
    const weightChange = Math.abs(currentWeight - goal.start_weight);
    if (weightChange >= 5 && weightChange % 5 === 0) {
      toast.success(`🏆 Marco atingido! ${weightChange}kg de progresso!`);
    }

    const { error } = await supabase
      .from('weight_goals')
      .update(updateData)
      .eq('id', goalId);

    if (error) {
      console.error('Error updating goal:', error);
      return;
    }

    loadGoals();
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('weight_goals')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erro ao excluir meta");
      return;
    }

    toast.success("Meta excluída!");
    loadGoals();
  };

  useEffect(() => {
    loadGoals();
  }, [user]);

  return {
    goals,
    activeGoal,
    loading,
    createGoal,
    updateGoalProgress,
    deleteGoal,
    refreshData: loadGoals
  };
};
