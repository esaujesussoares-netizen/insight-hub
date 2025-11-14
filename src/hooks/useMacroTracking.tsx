import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/untyped";
import { useAuth } from "@/hooks/useAuth";

interface MacroData {
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroGoals {
  protein: number;
  carbs: number;
  fat: number;
}

interface WeeklyMacro {
  day: string;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
}

export const useMacroTracking = () => {
  const { user } = useAuth();
  const [todayMacros, setTodayMacros] = useState<MacroData>({ protein: 0, carbs: 0, fat: 0 });
  const [yesterdayMacros, setYesterdayMacros] = useState<MacroData>({ protein: 0, carbs: 0, fat: 0 });
  const [macroGoals, setMacroGoals] = useState<MacroGoals>({ protein: 150, carbs: 250, fat: 65 });
  const [weeklyData, setWeeklyData] = useState<WeeklyMacro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMacroData();
    }
  }, [user]);

  const loadMacroData = async () => {
    try {
      setLoading(true);
      
      // Load macro goals from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_protein_goal, daily_carbs_goal, daily_fat_goal')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profile) {
        setMacroGoals({
          protein: profile.daily_protein_goal || 150,
          carbs: profile.daily_carbs_goal || 250,
          fat: profile.daily_fat_goal || 65,
        });
      }

      // Load today's macros
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: todayMeals } = await supabase
        .from('meals')
        .select('protein, carbs, fat')
        .eq('user_id', user?.id)
        .gte('meal_date', today.toISOString())
        .lt('meal_date', tomorrow.toISOString());

      const todayTotals = todayMeals?.reduce(
        (acc, meal) => ({
          protein: acc.protein + (Number(meal.protein) || 0),
          carbs: acc.carbs + (Number(meal.carbs) || 0),
          fat: acc.fat + (Number(meal.fat) || 0),
        }),
        { protein: 0, carbs: 0, fat: 0 }
      ) || { protein: 0, carbs: 0, fat: 0 };

      setTodayMacros(todayTotals);

      // Load yesterday's macros
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: yesterdayMeals } = await supabase
        .from('meals')
        .select('protein, carbs, fat')
        .eq('user_id', user?.id)
        .gte('meal_date', yesterday.toISOString())
        .lt('meal_date', today.toISOString());

      const yesterdayTotals = yesterdayMeals?.reduce(
        (acc, meal) => ({
          protein: acc.protein + (Number(meal.protein) || 0),
          carbs: acc.carbs + (Number(meal.carbs) || 0),
          fat: acc.fat + (Number(meal.fat) || 0),
        }),
        { protein: 0, carbs: 0, fat: 0 }
      ) || { protein: 0, carbs: 0, fat: 0 };

      setYesterdayMacros(yesterdayTotals);

      // Load weekly data
      await loadWeeklyData();
    } catch (error) {
      console.error('Erro ao carregar dados de macros:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyData = async () => {
    try {
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const weekData: WeeklyMacro[] = [];

      for (let i = 6; i >= 0; i--) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - i);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);

        const dateStr = startDate.toISOString().split('T')[0];
        const dayName = days[startDate.getDay()];

        const { data } = await supabase
          .from('meals')
          .select('protein, carbs, fat')
          .eq('user_id', user?.id)
          .gte('meal_date', startDate.toISOString())
          .lt('meal_date', endDate.toISOString());

        const totals = data?.reduce(
          (acc, meal) => ({
            protein: acc.protein + (Number(meal.protein) || 0),
            carbs: acc.carbs + (Number(meal.carbs) || 0),
            fat: acc.fat + (Number(meal.fat) || 0),
          }),
          { protein: 0, carbs: 0, fat: 0 }
        ) || { protein: 0, carbs: 0, fat: 0 };

        weekData.push({
          day: dayName,
          date: dateStr,
          ...totals,
        });
      }

      setWeeklyData(weekData);
    } catch (error) {
      console.error('Erro ao carregar dados semanais:', error);
    }
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return {
    todayMacros,
    yesterdayMacros,
    macroGoals,
    weeklyData,
    loading,
    getPercentageChange,
    refreshData: loadMacroData,
  };
};
