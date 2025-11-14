import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/untyped";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface BodyMetrics {
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  bmi?: number;
}

export const useBodyMetrics = () => {
  const { user } = useAuth();
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const loadBodyMetrics = async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('measurement_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setBodyMetrics({
        weight: Number(data.weight),
        bodyFat: Number(data.body_fat_percentage),
        muscleMass: Number(data.muscle_mass),
        bmi: Number(data.bmi)
      });
    }
    setLoading(false);
  };

  const updateBodyMetrics = async (metrics: {
    weight?: number;
    bodyFat?: number;
    muscleMass?: number;
  }, onWeightUpdate?: (weight: number) => void) => {
    if (!user) return;

    // Calcular IMC se peso e altura estiverem disponíveis
    let bmi = undefined;
    if (metrics.weight) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('height')
        .eq('user_id', user.id)
        .single();

      if (profile?.height) {
        const heightInMeters = Number(profile.height) / 100;
        bmi = metrics.weight / (heightInMeters * heightInMeters);
      }
    }

    const { error } = await supabase
      .from('body_metrics')
      .insert({
        user_id: user.id,
        weight: metrics.weight,
        body_fat_percentage: metrics.bodyFat,
        muscle_mass: metrics.muscleMass,
        bmi: bmi
      });

    if (error) {
      toast.error("Erro ao atualizar métricas");
      return;
    }

    toast.success("Métricas atualizadas!");
    loadBodyMetrics();
    
    // Callback para atualizar meta de peso se fornecido
    if (metrics.weight && onWeightUpdate) {
      onWeightUpdate(metrics.weight);
    }
  };

  useEffect(() => {
    loadBodyMetrics();
  }, [user]);

  return {
    bodyMetrics,
    loading,
    updateBodyMetrics: (metrics: any, onWeightUpdate?: (weight: number) => void) => 
      updateBodyMetrics(metrics, onWeightUpdate),
    refreshData: loadBodyMetrics
  };
};
