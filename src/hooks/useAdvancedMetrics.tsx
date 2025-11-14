import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/untyped";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AdvancedMetric {
  id: string;
  measurement_date: string;
  basal_metabolic_rate?: number;
  body_water_percentage?: number;
  bone_mass?: number;
  visceral_fat?: number;
  metabolic_age?: number;
  notes?: string;
}

export const useAdvancedMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AdvancedMetric[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMetrics = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('advanced_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('measurement_date', { ascending: false });

    if (error) {
      console.error('Error loading advanced metrics:', error);
    } else if (data) {
      setMetrics(data);
    }
    setLoading(false);
  };

  const addMetric = async (metric: Omit<AdvancedMetric, 'id' | 'measurement_date'>) => {
    if (!user) return;

    const { error } = await supabase
      .from('advanced_metrics')
      .insert({
        user_id: user.id,
        ...metric
      });

    if (error) {
      toast.error("Erro ao adicionar métricas");
      console.error('Error adding metric:', error);
      return;
    }

    toast.success("Métricas adicionadas!");
    loadMetrics();
  };

  const deleteMetric = async (id: string) => {
    const { error } = await supabase
      .from('advanced_metrics')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erro ao excluir métricas");
      return;
    }

    toast.success("Métricas excluídas!");
    loadMetrics();
  };

  useEffect(() => {
    loadMetrics();
  }, [user]);

  return {
    metrics,
    loading,
    addMetric,
    deleteMetric,
    refreshData: loadMetrics
  };
};
