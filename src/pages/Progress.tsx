import { Layout } from "@/components/Layout";
import { GymCard } from "@/components/GymCard";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Target, Calendar, Award, Flame, Dumbbell, Scale, Clock, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/untyped";
import { useState, useEffect } from "react";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import { useStrengthProgress } from "@/hooks/useStrengthProgress";
import { useBodyMetrics } from "@/hooks/useBodyMetrics";
import { UpdateMetricsDialog } from "@/components/UpdateMetricsDialog";
import { SetGoalsDialog } from "@/components/SetGoalsDialog";
import { BodyMetricsView } from "@/components/BodyMetricsView";
import { useNavigate } from "react-router-dom";
import { EditableAvatar } from "@/components/EditableAvatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Progress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { weeklyStats } = useProgressTracking();
  const { progressData, addNewExercise, calculateProgress } = useStrengthProgress();
  const { bodyMetrics, updateBodyMetrics } = useBodyMetrics();
  
  const [achievements, setAchievements] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({
    workoutsCompleted: 0,
    caloriesBurned: 0,
    totalTime: 0,
    currentStreak: 0,
    mealsRegistered: 0,
    calorieGoalDays: 0,
    avgProtein: 0,
    aiAnalyses: 0
  });
  const [goals, setGoals] = useState<any[]>([]);

  // Profile data state
  type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'maintenance';
  interface UserProfileData {
    name: string;
    email: string;
    age: number | null;
    weight: number | null;
    height: number | null;
    fitness_goal: FitnessGoal | '';
  }

  const [userData, setUserData] = useState<UserProfileData>({
    name: '',
    email: '',
    age: null,
    weight: null,
    height: null,
    fitness_goal: ''
  });
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    const loadAchievements = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');

      if (data) {
        setAchievements(data.map(a => ({
          name: a.achievement_name,
          description: a.achievement_description,
          completed: a.completed,
          points: a.points,
          progress: a.progress_current && a.progress_target ? 
            Math.round((a.progress_current / a.progress_target) * 100) : undefined
        })));
      }
    };

    const loadMonthlyStats = async () => {
      if (!user) return;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: monthWorkouts } = await supabase
        .from('workout_history')
        .select('calories_burned, duration_seconds, completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', thirtyDaysAgo.toISOString());

      const workoutsCompleted = monthWorkouts?.length || 0;
      const caloriesBurned = monthWorkouts?.reduce((sum, w) => sum + (w.calories_burned || 0), 0) || 0;
      const totalSeconds = monthWorkouts?.reduce((sum, w) => sum + (w.duration_seconds || 0), 0) || 0;
      const totalTime = Math.round((totalSeconds / 3600) * 10) / 10;

      const { data: monthMeals } = await supabase
        .from('meals')
        .select('calories, protein, meal_date')
        .eq('user_id', user.id)
        .gte('meal_date', thirtyDaysAgo.toISOString());

      const mealsRegistered = monthMeals?.length || 0;
      
      const dailyCalories: { [key: string]: number } = {};
      monthMeals?.forEach((meal: any) => {
        const date = new Date(meal.meal_date).toISOString().split('T')[0];
        dailyCalories[date] = (dailyCalories[date] || 0) + (Number(meal.calories) || 0);
      });
      const calorieGoalDays = Object.values(dailyCalories).filter(cal => cal >= 1800 && cal <= 2400).length;

      const dailyProtein: { [key: string]: number } = {};
      monthMeals?.forEach((meal: any) => {
        const date = new Date(meal.meal_date).toISOString().split('T')[0];
        dailyProtein[date] = (dailyProtein[date] || 0) + (Number(meal.protein) || 0);
      });
      const avgProtein = Object.keys(dailyProtein).length > 0 ?
        Math.round(Object.values(dailyProtein).reduce((a, b) => a + b, 0) / Object.keys(dailyProtein).length) : 0;

      const currentStreak = await calculateWorkoutStreak(user.id);

      const aiAnalyses = 0;

      setMonthlyStats({
        workoutsCompleted,
        caloriesBurned: Math.round(caloriesBurned),
        totalTime,
        currentStreak,
        mealsRegistered,
        calorieGoalDays,
        avgProtein,
        aiAnalyses
      });
    };

    const loadGoals = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .is('completed_at', null)
        .order('created_at')
        .limit(3);

      if (data) {
        setGoals(data.map(g => ({
          name: g.goal_name,
          target: g.target_value,
          current: g.current_value || 0,
          unit: g.unit || '',
          remaining: g.target_value - (g.current_value || 0)
        })));
      }
    };

    loadAchievements();
    loadMonthlyStats();
    loadGoals();
  }, [user]);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setUserData(prev => ({ ...prev, email: '' }));
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile) {
          setAvatarUrl(profile.avatar_url || '');
          
          let displayName = profile.name || '';
          if (displayName.includes('@')) {
            displayName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         displayName.split('@')[0].replace(/[.+]/g, ' ');
          }
          
          setUserData({
            name: displayName,
            email: user.email ?? '',
            age: profile.age ?? null,
            weight: profile.weight ?? null,
            height: profile.height ?? null,
            fitness_goal: profile.fitness_goal as FitnessGoal ?? ''
          });
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    };

    loadProfile();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          age: userData.age,
          weight: userData.weight,
          height: userData.height,
          fitness_goal: userData.fitness_goal || null
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar seu perfil.",
        variant: "destructive",
      });
    }
  };

  const calculateWorkoutStreak = async (userId: string): Promise<number> => {
    const { data: workouts } = await supabase
      .from('workout_history')
      .select('completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (!workouts || workouts.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const workout of workouts) {
      const workoutDate = new Date(workout.completed_at);
      workoutDate.setHours(0, 0, 0, 0);
      
      const diffTime = currentDate.getTime() - workoutDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak || (streak === 0 && diffDays <= 1)) {
        streak = diffDays + 1;
      } else {
        break;
      }
    }

    return streak;
  };

  const weeklyStatsDisplay = [
    { 
      icon: <Dumbbell className="w-6 h-6" />, 
      title: "Treinos Semanais", 
      value: weeklyStats.workouts.toString(), 
      change: weeklyStats.workoutsChange > 0 ? `+${weeklyStats.workoutsChange}%` : `${weeklyStats.workoutsChange}%`, 
      variant: "default" as const 
    },
    { 
      icon: <Flame className="w-6 h-6" />, 
      title: "Calorias Queimadas", 
      value: weeklyStats.calories >= 1000 ? `${(weeklyStats.calories / 1000).toFixed(1)}K` : weeklyStats.calories.toString(), 
      change: weeklyStats.caloriesChange > 0 ? `+${weeklyStats.caloriesChange}%` : `${weeklyStats.caloriesChange}%`, 
      variant: "fitness" as const 
    },
    { 
      icon: <Target className="w-6 h-6" />, 
      title: "Meta Nutricional", 
      value: `${weeklyStats.nutritionGoal}%`, 
      change: weeklyStats.nutritionChange > 0 ? `+${weeklyStats.nutritionChange}%` : `${weeklyStats.nutritionChange}%`, 
      variant: "nutrition" as const 
    },
    { 
      icon: <Clock className="w-6 h-6" />, 
      title: "Tempo de Treino", 
      value: `${weeklyStats.workoutTime}h`, 
      change: weeklyStats.timeChange > 0 ? `+${weeklyStats.timeChange}%` : `${weeklyStats.timeChange}%`, 
      variant: "default" as const 
    },
  ];

  return (
    <Layout>
      <Tabs defaultValue="overview" className="w-full">
        {/* === MODIFICAÇÃO: Removida aba "Perfil" - acesso apenas pelo menu inferior === */}
        <TabsList className="w-full grid grid-cols-2 mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="body">Métricas Corporais</TabsTrigger>
        </TabsList>

        <TabsContent value="body" className="space-y-6 pb-20">
          <BodyMetricsView />
        </TabsContent>

        {/* === MODIFICAÇÃO: Seção de Perfil removida - acesso apenas pela página /profile === */}

        <TabsContent value="overview" className="space-y-6 pb-20">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Progresso</h1>
              <p className="text-muted-foreground">Acompanhe sua evolução</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/workout-time")}>
                <Clock className="w-4 h-4 mr-2" />
                Tempo
              </Button>
              <Button variant="outline" onClick={() => navigate("/calories-burned")}>
                <Flame className="w-4 h-4 mr-2" />
                Calorias
              </Button>
              <Button variant="outline" onClick={() => navigate("/protein-goal")}>
                <Dumbbell className="w-4 h-4 mr-2" />
                Proteína
              </Button>
            </div>
          </div>

          {/* Estatísticas Semanais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {weeklyStatsDisplay.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Grid Principal de Progresso */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Progresso de Força */}
            <GymCard
              variant="fitness"
              title="Evolução de Força"
              description="Progresso nos exercícios principais"
              className="lg:col-span-2"
            >
              <div className="space-y-6">
                {progressData.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum exercício rastreado ainda. Comece a registrar seu progresso!
                  </p>
                ) : progressData.map((exercise, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{exercise.exercise}</h3>
                      <Badge variant="outline">
                        {exercise.currentWeight}{exercise.unit} / {exercise.targetWeight}{exercise.unit}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Inicial: {exercise.startWeight}{exercise.unit}</span>
                      <span>•</span>
                      <span>Meta: {exercise.targetWeight}{exercise.unit}</span>
                      <span>•</span>
                      <span className="text-primary font-medium">
                        +{exercise.currentWeight - exercise.startWeight}{exercise.unit}
                      </span>
                    </div>
                    
                    <ProgressBar 
                      value={calculateProgress(exercise.startWeight, exercise.currentWeight, exercise.targetWeight)} 
                      className="h-2"
                    />
                  </div>
                ))}
                
                <SetGoalsDialog onAddExercise={addNewExercise} />
              </div>
            </GymCard>

            {/* Métricas Corporais */}
            <GymCard
              variant="default"
              title="Métricas Corporais"
              description="Acompanhe seu corpo"
            >
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Scale className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Peso Atual</p>
                        <p className="text-2xl font-bold">{bodyMetrics?.weight?.toFixed(1) || '--'} kg</p>
                      </div>
                    </div>
                  </div>
                  
                  {bodyMetrics?.bmi && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-1">IMC</p>
                      <p className="text-xl font-semibold">{bodyMetrics.bmi.toFixed(1)}</p>
                    </div>
                  )}
                  
                  {bodyMetrics?.bodyFat && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Gordura Corporal</p>
                      <p className="text-xl font-semibold">{bodyMetrics.bodyFat.toFixed(1)}%</p>
                    </div>
                  )}
                  
                  {bodyMetrics?.muscleMass && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Massa Muscular</p>
                      <p className="text-xl font-semibold">{bodyMetrics.muscleMass.toFixed(1)} kg</p>
                    </div>
                  )}
                </div>
                
                <UpdateMetricsDialog onUpdate={updateBodyMetrics} trigger={
                  <Button className="w-full">
                    <Scale className="w-4 h-4 mr-2" />
                    Atualizar Métricas
                  </Button>
                } />
              </div>
            </GymCard>
          </div>

          {/* Conquistas */}
          <GymCard
            variant="default"
            title="Conquistas"
            description="Seus marcos alcançados"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    achievement.completed 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Award className={`w-6 h-6 ${achievement.completed ? 'text-primary' : 'text-muted-foreground'}`} />
                    <Badge variant={achievement.completed ? "default" : "outline"}>
                      {achievement.points} pts
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                  {achievement.progress !== undefined && !achievement.completed && (
                    <ProgressBar value={achievement.progress} className="h-2" />
                  )}
                  {achievement.completed && (
                    <Badge variant="default" className="w-full justify-center">
                      Completo!
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </GymCard>

          {/* Resumo Mensal */}
          <div className="grid lg:grid-cols-2 gap-6">
            <GymCard
              variant="fitness"
              title="Resumo Fitness (30 dias)"
              description="Suas estatísticas do último mês"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Treinos Completados</span>
                  <span className="font-semibold text-lg">{monthlyStats.workoutsCompleted}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Calorias Queimadas</span>
                  <span className="font-semibold text-lg">{monthlyStats.caloriesBurned.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Tempo Total</span>
                  <span className="font-semibold text-lg">{monthlyStats.totalTime}h</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Sequência Atual</span>
                  <Badge variant="default" className="text-lg px-3 py-1">
                    {monthlyStats.currentStreak} dias 🔥
                  </Badge>
                </div>
              </div>
            </GymCard>

            <GymCard
              variant="nutrition"
              title="Resumo Nutricional (30 dias)"
              description="Suas estatísticas do último mês"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Refeições Registradas</span>
                  <span className="font-semibold text-lg">{monthlyStats.mealsRegistered}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Dias na Meta Calórica</span>
                  <span className="font-semibold text-lg">{monthlyStats.calorieGoalDays}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Proteína Média/Dia</span>
                  <span className="font-semibold text-lg">{monthlyStats.avgProtein}g</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Análises de IA</span>
                  <span className="font-semibold text-lg">{monthlyStats.aiAnalyses}</span>
                </div>
              </div>
            </GymCard>
          </div>

          {/* Próximas Metas */}
          <GymCard
            variant="default"
            title="Próximas Metas"
            description="Objetivos em andamento"
          >
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  <ProgressBar 
                    value={(goal.current / goal.target) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                <Target className="w-4 h-4" />
                Ver Todas
              </Button>
            </div>
          </GymCard>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Progress;
