import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/untyped";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface BodyMeasurement {
  id: string;
  measurement_date: string;
  neck?: number;
  shoulders?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  left_arm?: number;
  right_arm?: number;
  left_forearm?: number;
  right_forearm?: number;
  left_thigh?: number;
  right_thigh?: number;
  left_calf?: number;
  right_calf?: number;
  triceps_skinfold?: number;
  biceps_skinfold?: number;
  subscapular_skinfold?: number;
  suprailiac_skinfold?: number;
  abdominal_skinfold?: number;
  thigh_skinfold?: number;
  calf_skinfold?: number;
  notes?: string;
}

export const useBodyMeasurements = () => {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMeasurements = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('measurement_date', { ascending: false });

    if (error) {
      console.error('Error loading measurements:', error);
    } else if (data) {
      setMeasurements(data);
    }
    setLoading(false);
  };

  const addMeasurement = async (measurement: Omit<BodyMeasurement, 'id' | 'measurement_date'>) => {
    if (!user) return;

    const { error } = await supabase
      .from('body_measurements')
      .insert({
        user_id: user.id,
        ...measurement
      });

    if (error) {
      toast.error("Erro ao adicionar medidas");
      console.error('Error adding measurement:', error);
      return;
    }

    toast.success("Medidas adicionadas!");
    loadMeasurements();
  };

  const deleteMeasurement = async (id: string) => {
    const { error } = await supabase
      .from('body_measurements')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erro ao excluir medidas");
      return;
    }

    toast.success("Medidas excluídas!");
    loadMeasurements();
  };

  useEffect(() => {
    loadMeasurements();
  }, [user]);

  return {
    measurements,
    loading,
    addMeasurement,
    deleteMeasurement,
    refreshData: loadMeasurements
  };
};
