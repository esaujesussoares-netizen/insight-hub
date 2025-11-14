import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/untyped";
import { useAuth } from "@/hooks/useAuth";

interface ProgressData {
  weight: Array<{ date: string; value: number }>;
  bodyFat: Array<{ date: string; value: number }>;
  muscleMass: Array<{ date: string; value: number }>;
  bmi: Array<{ date: string; value: number }>;
  measurements: {
    chest: Array<{ date: string; value: number }>;
    waist: Array<{ date: string; value: number }>;
    hips: Array<{ date: string; value: number }>;
    leftArm: Array<{ date: string; value: number }>;
    rightArm: Array<{ date: string; value: number }>;
    leftThigh: Array<{ date: string; value: number }>;
    rightThigh: Array<{ date: string; value: number }>;
  };
  advancedMetrics: {
    bmr: Array<{ date: string; value: number }>;
    bodyWater: Array<{ date: string; value: number }>;
    boneMass: Array<{ date: string; value: number }>;
    visceralFat: Array<{ date: string; value: number }>;
  };
  photos: Array<{
    id: string;
    date: string;
    url: string;
    type: string;
    weight?: number;
  }>;
}

interface ProgressSummary {
  weightChange: number;
  bodyFatChange: number;
  muscleMassChange: number;
  bmiChange: number;
  totalMeasurementsChange: number;
}

export const useBodyProgressReport = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData>({
    weight: [],
    bodyFat: [],
    muscleMass: [],
    bmi: [],
    measurements: {
      chest: [],
      waist: [],
      hips: [],
      leftArm: [],
      rightArm: [],
      leftThigh: [],
      rightThigh: [],
    },
    advancedMetrics: {
      bmr: [],
      bodyWater: [],
      boneMass: [],
      visceralFat: [],
    },
    photos: [],
  });
  const [summary, setSummary] = useState<ProgressSummary>({
    weightChange: 0,
    bodyFatChange: 0,
    muscleMassChange: 0,
    bmiChange: 0,
    totalMeasurementsChange: 0,
  });
  const [loading, setLoading] = useState(false);

  const loadProgressData = async (startDate: Date, endDate: Date) => {
    if (!user) return;
    setLoading(true);

    try {
      // Buscar métricas corporais
      const { data: bodyMetrics } = await supabase
        .from('body_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      // Buscar medidas corporais
      const { data: measurements } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .gte('measurement_date', startDate.toISOString())
        .lte('measurement_date', endDate.toISOString())
        .order('measurement_date', { ascending: true });

      // Buscar métricas avançadas
      const { data: advancedMetrics } = await supabase
        .from('advanced_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('measurement_date', startDate.toISOString())
        .lte('measurement_date', endDate.toISOString())
        .order('measurement_date', { ascending: true });

      // Buscar fotos
      const { data: photos } = await supabase
        .from('body_photos')
        .select('*')
        .eq('user_id', user.id)
        .gte('photo_date', startDate.toISOString())
        .lte('photo_date', endDate.toISOString())
        .order('photo_date', { ascending: true });

      // Processar dados de métricas corporais
      const weightData = bodyMetrics?.map(m => ({
        date: m.created_at,
        value: Number(m.weight),
      })) || [];

      const bodyFatData = bodyMetrics?.filter(m => m.body_fat_percentage).map(m => ({
        date: m.created_at,
        value: Number(m.body_fat_percentage),
      })) || [];

      const muscleMassData = bodyMetrics?.filter(m => m.muscle_mass).map(m => ({
        date: m.created_at,
        value: Number(m.muscle_mass),
      })) || [];

      const bmiData = bodyMetrics?.filter(m => m.bmi).map(m => ({
        date: m.created_at,
        value: Number(m.bmi),
      })) || [];

      // Processar medidas corporais
      const measurementsData = {
        chest: measurements?.filter(m => m.chest).map(m => ({
          date: m.measurement_date,
          value: Number(m.chest),
        })) || [],
        waist: measurements?.filter(m => m.waist).map(m => ({
          date: m.measurement_date,
          value: Number(m.waist),
        })) || [],
        hips: measurements?.filter(m => m.hips).map(m => ({
          date: m.measurement_date,
          value: Number(m.hips),
        })) || [],
        leftArm: measurements?.filter(m => m.left_arm).map(m => ({
          date: m.measurement_date,
          value: Number(m.left_arm),
        })) || [],
        rightArm: measurements?.filter(m => m.right_arm).map(m => ({
          date: m.measurement_date,
          value: Number(m.right_arm),
        })) || [],
        leftThigh: measurements?.filter(m => m.left_thigh).map(m => ({
          date: m.measurement_date,
          value: Number(m.left_thigh),
        })) || [],
        rightThigh: measurements?.filter(m => m.right_thigh).map(m => ({
          date: m.measurement_date,
          value: Number(m.right_thigh),
        })) || [],
      };

      // Processar métricas avançadas
      const advancedMetricsData = {
        bmr: advancedMetrics?.filter(m => m.basal_metabolic_rate).map(m => ({
          date: m.measurement_date,
          value: Number(m.basal_metabolic_rate),
        })) || [],
        bodyWater: advancedMetrics?.filter(m => m.body_water_percentage).map(m => ({
          date: m.measurement_date,
          value: Number(m.body_water_percentage),
        })) || [],
        boneMass: advancedMetrics?.filter(m => m.bone_mass).map(m => ({
          date: m.measurement_date,
          value: Number(m.bone_mass),
        })) || [],
        visceralFat: advancedMetrics?.filter(m => m.visceral_fat).map(m => ({
          date: m.measurement_date,
          value: Number(m.visceral_fat),
        })) || [],
      };

      // Processar fotos
      const photosData = photos?.map(p => ({
        id: p.id,
        date: p.photo_date,
        url: p.photo_url,
        type: p.photo_type || 'front',
        weight: p.weight_at_photo ? Number(p.weight_at_photo) : undefined,
      })) || [];

      setProgressData({
        weight: weightData,
        bodyFat: bodyFatData,
        muscleMass: muscleMassData,
        bmi: bmiData,
        measurements: measurementsData,
        advancedMetrics: advancedMetricsData,
        photos: photosData,
      });

      // Calcular resumo de mudanças
      const weightChange = weightData.length >= 2 
        ? weightData[weightData.length - 1].value - weightData[0].value 
        : 0;
      
      const bodyFatChange = bodyFatData.length >= 2
        ? bodyFatData[bodyFatData.length - 1].value - bodyFatData[0].value
        : 0;
      
      const muscleMassChange = muscleMassData.length >= 2
        ? muscleMassData[muscleMassData.length - 1].value - muscleMassData[0].value
        : 0;
      
      const bmiChange = bmiData.length >= 2
        ? bmiData[bmiData.length - 1].value - bmiData[0].value
        : 0;

      // Calcular mudança total de medidas (soma de peito, cintura, quadril)
      let totalMeasurementsChange = 0;
      if (measurementsData.chest.length >= 2) {
        totalMeasurementsChange += measurementsData.chest[measurementsData.chest.length - 1].value - measurementsData.chest[0].value;
      }
      if (measurementsData.waist.length >= 2) {
        totalMeasurementsChange += measurementsData.waist[measurementsData.waist.length - 1].value - measurementsData.waist[0].value;
      }
      if (measurementsData.hips.length >= 2) {
        totalMeasurementsChange += measurementsData.hips[measurementsData.hips.length - 1].value - measurementsData.hips[0].value;
      }

      setSummary({
        weightChange,
        bodyFatChange,
        muscleMassChange,
        bmiChange,
        totalMeasurementsChange,
      });
    } catch (error) {
      console.error('Erro ao carregar dados de progresso:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    progressData,
    summary,
    loading,
    loadProgressData,
  };
};
