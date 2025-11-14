import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/untyped";
import { useAuth } from "@/hooks/useAuth";

export const useProgressTracking = () => {
  const { user } = useAuth();
  const [weeklyStats, setWeeklyStats] = useState({
    workouts: 0,
    calories: 0,
    nutritionGoal: 0,
    workoutTime: 0,
    workoutsChange: 0,
    caloriesChange: 0,
    nutritionChange: 0,
    timeChange: 0
  });

  useEffect(() => {
    const loadWeeklyStats = async () => {
      if (!user) return;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      // Dados da semana atual
      const { data: currentWorkouts } = await supabase
        .from('workout_history')
        .select('id, duration_seconds, calories_burned')
        .eq('user_id', user.id)
        .gte('completed_at', sevenDaysAgo.toISOString());

      // Dados da semana anterior
      const { data: previousWorkouts } = await supabase
        .from('workout_history')
        .select('id, duration_seconds, calories_burned')
        .eq('user_id', user.id)
        .gte('completed_at', fourteenDaysAgo.toISOString())
        .lt('completed_at', sevenDaysAgo.toISOString());

      const currentWorkoutsCount = currentWorkouts?.length || 0;
      const previousWorkoutsCount = previousWorkouts?.length || 0;
      const workoutsChange = previousWorkoutsCount > 0 
        ? Math.round(((currentWorkoutsCount - previousWorkoutsCount) / previousWorkoutsCount) * 100)
        : 0;

      const currentCalories = currentWorkouts?.reduce((sum, w) => sum + (w.calories_burned || 0), 0) || 0;
      const previousCalories = previousWorkouts?.reduce((sum, w) => sum + (w.calories_burned || 0), 0) || 0;
      const caloriesChange = previousCalories > 0
        ? Math.round(((currentCalories - previousCalories) / previousCalories) * 100)
        : 0;

      const currentSeconds = currentWorkouts?.reduce((sum, w) => sum + (w.duration_seconds || 0), 0) || 0;
      const currentHours = Math.round((currentSeconds / 3600) * 10) / 10;
      const previousSeconds = previousWorkouts?.reduce((sum, w) => sum + (w.duration_seconds || 0), 0) || 0;
      const timeChange = previousSeconds > 0
        ? Math.round(((currentSeconds - previousSeconds) / previousSeconds) * 100)
        : 0;

      // Meta nutricional
      const { data: currentMeals } = await supabase
        .from('meals')
        .select('total_calories, timestamp')
        .eq('user_id', user.id)
        .gte('timestamp', sevenDaysAgo.toISOString());

      const { data: previousMeals } = await supabase
        .from('meals')
        .select('total_calories, timestamp')
        .eq('user_id', user.id)
        .gte('timestamp', fourteenDaysAgo.toISOString())
        .lt('timestamp', sevenDaysAgo.toISOString());

      let currentNutritionGoal = 0;
      let previousNutritionGoal = 0;

      if (currentMeals && currentMeals.length > 0) {
        const dailyCalories: { [key: string]: number } = {};
        currentMeals.forEach((meal: any) => {
          const date = new Date(meal.timestamp).toISOString().split('T')[0];
          dailyCalories[date] = (dailyCalories[date] || 0) + (Number(meal.total_calories) || 0);
        });
        const days = Object.keys(dailyCalories).length;
        if (days > 0) {
          const totalPercentage = Object.values(dailyCalories).reduce((acc, cal) => 
            acc + Math.min((cal / 2200) * 100, 100), 0
          );
          currentNutritionGoal = Math.round(totalPercentage / days);
        }
      }

      if (previousMeals && previousMeals.length > 0) {
        const dailyCalories: { [key: string]: number } = {};
        previousMeals.forEach((meal: any) => {
          const date = new Date(meal.timestamp).toISOString().split('T')[0];
          dailyCalories[date] = (dailyCalories[date] || 0) + (Number(meal.total_calories) || 0);
        });
        const days = Object.keys(dailyCalories).length;
        if (days > 0) {
          const totalPercentage = Object.values(dailyCalories).reduce((acc, cal) => 
            acc + Math.min((cal / 2200) * 100, 100), 0
          );
          previousNutritionGoal = Math.round(totalPercentage / days);
        }
      }

      const nutritionChange = previousNutritionGoal > 0
        ? Math.round(((currentNutritionGoal - previousNutritionGoal) / previousNutritionGoal) * 100)
        : 0;

      setWeeklyStats({
        workouts: currentWorkoutsCount,
        calories: currentCalories,
        nutritionGoal: currentNutritionGoal,
        workoutTime: currentHours,
        workoutsChange,
        caloriesChange,
        nutritionChange,
        timeChange
      });
    };

    loadWeeklyStats();
  }, [user]);

  return { weeklyStats };
};
