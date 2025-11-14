import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/untyped";
import { useAuth } from "@/hooks/useAuth";

interface WorkoutHistoryEntry {
  id: string;
  workout_name: string;
  completed_at: string;
  duration_seconds: number;
  calories_burned: number;
}

interface DailyStats {
  date: string;
  workouts: number;
  calories: number;
  duration: number;
}

interface WeeklyStats {
  week: string;
  workouts: number;
  calories: number;
  avgDuration: number;
}

export const useWorkoutHistory = () => {
  const { user } = useAuth();
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    totalWorkouts: 0,
    totalCalories: 0,
    totalHours: 0,
    avgWorkoutsPerWeek: 0,
  });

  useEffect(() => {
    if (user) {
      loadWorkoutHistory();
    }
  }, [user]);

  const loadWorkoutHistory = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get last 90 days of workout history
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: workouts } = await supabase
        .from('workout_history')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', ninetyDaysAgo.toISOString())
        .order('completed_at', { ascending: true });

      if (workouts) {
        setWorkoutHistory(workouts);

        // Calculate daily stats
        const dailyMap = new Map<string, DailyStats>();
        workouts.forEach((workout) => {
          const date = new Date(workout.completed_at).toISOString().split('T')[0];
          const existing = dailyMap.get(date) || { date, workouts: 0, calories: 0, duration: 0 };
          dailyMap.set(date, {
            date,
            workouts: existing.workouts + 1,
            calories: existing.calories + (workout.calories_burned || 0),
            duration: existing.duration + (workout.duration_seconds || 0),
          });
        });

        const dailyArray = Array.from(dailyMap.values()).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setDailyStats(dailyArray);

        // Calculate weekly stats
        const weeklyMap = new Map<string, { workouts: number; calories: number; totalDuration: number; count: number }>();
        workouts.forEach((workout) => {
          const date = new Date(workout.completed_at);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekKey = weekStart.toISOString().split('T')[0];
          
          const existing = weeklyMap.get(weekKey) || { workouts: 0, calories: 0, totalDuration: 0, count: 0 };
          weeklyMap.set(weekKey, {
            workouts: existing.workouts + 1,
            calories: existing.calories + (workout.calories_burned || 0),
            totalDuration: existing.totalDuration + (workout.duration_seconds || 0),
            count: existing.count + 1,
          });
        });

        const weeklyArray = Array.from(weeklyMap.entries()).map(([week, stats]) => ({
          week: new Date(week).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
          workouts: stats.workouts,
          calories: stats.calories,
          avgDuration: Math.round(stats.totalDuration / stats.count / 60),
        })).sort((a, b) => a.week.localeCompare(b.week));
        setWeeklyStats(weeklyArray);

        // Calculate total stats
        const totalWorkouts = workouts.length;
        const totalCalories = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
        const totalSeconds = workouts.reduce((sum, w) => sum + (w.duration_seconds || 0), 0);
        const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;
        
        const daysCovered = dailyArray.length > 0 ? 
          (new Date(dailyArray[dailyArray.length - 1].date).getTime() - 
           new Date(dailyArray[0].date).getTime()) / (1000 * 60 * 60 * 24) : 0;
        const weeksCovered = daysCovered / 7;
        const avgWorkoutsPerWeek = weeksCovered > 0 ? Math.round((totalWorkouts / weeksCovered) * 10) / 10 : 0;

        setTotalStats({
          totalWorkouts,
          totalCalories,
          totalHours,
          avgWorkoutsPerWeek,
        });
      }
    } catch (error) {
      console.error('Error loading workout history:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    workoutHistory,
    dailyStats,
    weeklyStats,
    totalStats,
    loading,
    refreshHistory: loadWorkoutHistory,
  };
};
