import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/untyped";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";

interface WeeklyReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WeeklyStats {
  totalCalories: number;
  avgCalories: number;
  totalProtein: number;
  avgProtein: number;
  totalCarbs: number;
  avgCarbs: number;
  totalFat: number;
  avgFat: number;
  mealsCount: number;
  daysWithMeals: number;
}

export function WeeklyReportDialog({ open, onOpenChange }: WeeklyReportDialogProps) {
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [goals, setGoals] = useState({ calories: 2200, protein: 120, carbs: 220, fat: 60 });

  useEffect(() => {
    if (open) {
      loadWeeklyStats();
      loadGoals();
    }
  }, [open]);

  const loadGoals = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data } = await supabase
        .from('profiles')
        .select('daily_calories_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal')
        .eq('user_id', session.session.user.id)
        .single();

      if (data) {
        setGoals({
          calories: data.daily_calories_goal || 2200,
          protein: data.daily_protein_goal || 120,
          carbs: data.daily_carbs_goal || 220,
          fat: data.daily_fat_goal || 60
        });
      }
    } catch (error) {
      console.error("Erro ao carregar metas:", error);
    }
  };

  const loadWeeklyStats = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);

      const { data: meals } = await (supabase as any)
        .from('meals')
        .select('*')
        .eq('user_id', session.session.user.id)
        .gte('meal_time', weekAgo.toISOString())
        .lte('meal_time', today.toISOString());

      if (meals) {
        const totalCalories = meals.reduce((sum: number, meal: any) => sum + (Number(meal.calories) || 0), 0);
        const totalProtein = meals.reduce((sum: number, meal: any) => sum + (Number(meal.protein) || 0), 0);
        const totalCarbs = meals.reduce((sum: number, meal: any) => sum + (Number(meal.carbs) || 0), 0);
        const totalFat = meals.reduce((sum: number, meal: any) => sum + (Number(meal.fat) || 0), 0);

        const uniqueDays = new Set(meals.map((meal: any) => 
          new Date(meal.meal_time).toLocaleDateString()
        )).size;

        setWeeklyStats({
          totalCalories,
          avgCalories: totalCalories / 7,
          totalProtein,
          avgProtein: totalProtein / 7,
          totalCarbs,
          avgCarbs: totalCarbs / 7,
          totalFat,
          avgFat: totalFat / 7,
          mealsCount: meals.length,
          daysWithMeals: uniqueDays
        });
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (avg: number, goal: number) => {
    const percentage = (avg / goal) * 100;
    if (percentage > 105) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (percentage < 95) return <TrendingDown className="w-4 h-4 text-blue-500" />;
    return <Minus className="w-4 h-4 text-green-500" />;
  };

  const getProgressColor = (avg: number, goal: number) => {
    const percentage = (avg / goal) * 100;
    if (percentage > 105) return "bg-red-500";
    if (percentage < 95) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Calendar className="w-6 h-6" />
            Relatório Semanal
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando relatório...
          </div>
        ) : weeklyStats ? (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gradient-nutrition-subtle">
                <div className="text-3xl font-bold text-secondary">{weeklyStats.mealsCount}</div>
                <div className="text-sm text-muted-foreground">Refeições Registradas</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-nutrition-subtle">
                <div className="text-3xl font-bold text-secondary">{weeklyStats.daysWithMeals}/7</div>
                <div className="text-sm text-muted-foreground">Dias Ativos</div>
              </div>
            </div>

            {/* Calories */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    Calorias Diárias
                    {getTrendIcon(weeklyStats.avgCalories, goals.calories)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Média: {Math.round(weeklyStats.avgCalories)} kcal | Meta: {goals.calories} kcal
                  </p>
                </div>
                <div className="text-2xl font-bold text-secondary">
                  {Math.round(weeklyStats.totalCalories)} kcal
                </div>
              </div>
              <Progress 
                value={(weeklyStats.avgCalories / goals.calories) * 100} 
                className={`h-3 ${getProgressColor(weeklyStats.avgCalories, goals.calories)}`}
              />
            </div>

            {/* Macros */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      Proteínas
                      {getTrendIcon(weeklyStats.avgProtein, goals.protein)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Média: {Math.round(weeklyStats.avgProtein)}g | Meta: {goals.protein}g
                    </p>
                  </div>
                  <div className="text-xl font-bold text-secondary">
                    {Math.round(weeklyStats.totalProtein)}g
                  </div>
                </div>
                <Progress 
                  value={(weeklyStats.avgProtein / goals.protein) * 100} 
                  className={`h-2 ${getProgressColor(weeklyStats.avgProtein, goals.protein)}`}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      Carboidratos
                      {getTrendIcon(weeklyStats.avgCarbs, goals.carbs)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Média: {Math.round(weeklyStats.avgCarbs)}g | Meta: {goals.carbs}g
                    </p>
                  </div>
                  <div className="text-xl font-bold text-secondary">
                    {Math.round(weeklyStats.totalCarbs)}g
                  </div>
                </div>
                <Progress 
                  value={(weeklyStats.avgCarbs / goals.carbs) * 100} 
                  className={`h-2 ${getProgressColor(weeklyStats.avgCarbs, goals.carbs)}`}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      Gorduras
                      {getTrendIcon(weeklyStats.avgFat, goals.fat)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Média: {Math.round(weeklyStats.avgFat)}g | Meta: {goals.fat}g
                    </p>
                  </div>
                  <div className="text-xl font-bold text-secondary">
                    {Math.round(weeklyStats.totalFat)}g
                  </div>
                </div>
                <Progress 
                  value={(weeklyStats.avgFat / goals.fat) * 100} 
                  className={`h-2 ${getProgressColor(weeklyStats.avgFat, goals.fat)}`}
                />
              </div>
            </div>

            {/* Summary Message */}
            <div className="p-4 rounded-lg bg-muted">
              <h3 className="font-semibold mb-2">Resumo da Semana</h3>
              <p className="text-sm text-muted-foreground">
                {weeklyStats.daysWithMeals === 7 
                  ? "🎉 Parabéns! Você registrou refeições todos os dias da semana!" 
                  : `Continue assim! Você registrou refeições em ${weeklyStats.daysWithMeals} de 7 dias.`}
                {" "}Você consumiu um total de {Math.round(weeklyStats.totalCalories)} kcal esta semana,
                com uma média diária de {Math.round(weeklyStats.avgCalories)} kcal.
              </p>
            </div>

            <Button 
              variant="nutrition" 
              className="w-full" 
              onClick={() => onOpenChange(false)}
            >
              Fechar Relatório
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado disponível para esta semana
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
