import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Flame, TrendingUp, Plus, Activity, Edit, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/untyped";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalorieRecord {
  id: string;
  calories: number;
  date: string;
  activity_type?: string;
  duration_minutes?: number;
  notes?: string;
}

const CaloriesBurnedPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [todayCalories, setTodayCalories] = useState(0);
  const [yesterdayCalories, setYesterdayCalories] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{ day: string; calories: number; date: string }[]>([]);
  const [dailyGoal, setDailyGoal] = useState(500);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState(500);
  const [newRecord, setNewRecord] = useState({
    calories: "",
    activity_type: "",
    duration_minutes: "",
    notes: ""
  });
  const [achievements, setAchievements] = useState<string[]>([]);

  // Carregar dados do usuário
  useEffect(() => {
    loadUserData();
    loadWeeklyData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar meta diária
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_calories_burn_goal')
        .eq('user_id', user.id)
        .single();

      if (profile?.daily_calories_burn_goal) {
        setDailyGoal(profile.daily_calories_burn_goal);
        setNewGoal(profile.daily_calories_burn_goal);
      }

      // Carregar calorias de hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const { data: todayData } = await supabase
        .from('calories_burned')
        .select('calories')
        .eq('user_id', user.id)
        .gte('date', today.toISOString())
        .lt('date', tomorrow.toISOString());

      const todayTotal = todayData?.reduce((sum, record) => sum + record.calories, 0) || 0;
      setTodayCalories(todayTotal);

      // Carregar calorias de ontem
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBeforeYesterday = new Date(yesterday);
      dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);
      dayBeforeYesterday.setHours(0, 0, 0, 0);
      
      const { data: yesterdayData } = await supabase
        .from('calories_burned')
        .select('calories')
        .eq('user_id', user.id)
        .gte('date', dayBeforeYesterday.toISOString())
        .lt('date', yesterday.toISOString());

      const yesterdayTotal = yesterdayData?.reduce((sum, record) => sum + record.calories, 0) || 0;
      setYesterdayCalories(yesterdayTotal);

      // Verificar conquistas
      checkAchievements(todayTotal);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const loadWeeklyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const weekData: { day: string; calories: number; date: string }[] = [];

      for (let i = 6; i >= 0; i--) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - i);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        
        const dateStr = startDate.toISOString().split('T')[0];
        const dayName = days[startDate.getDay()];

        const { data } = await supabase
          .from('calories_burned')
          .select('calories')
          .eq('user_id', user.id)
          .gte('date', startDate.toISOString())
          .lt('date', endDate.toISOString());

        const total = data?.reduce((sum, record) => sum + record.calories, 0) || 0;
        weekData.push({ day: dayName, calories: total, date: dateStr });
      }

      setWeeklyData(weekData);
    } catch (error) {
      console.error('Erro ao carregar dados semanais:', error);
    }
  };

  const checkAchievements = (calories: number) => {
    const newAchievements: string[] = [];
    if (calories >= dailyGoal) newAchievements.push("Meta diária atingida! 🎯");
    if (calories >= dailyGoal * 1.5) newAchievements.push("Superou a meta em 50%! 🔥");
    if (calories >= 1000) newAchievements.push("1000 kcal queimadas! 💪");
    setAchievements(newAchievements);
  };

  const handleAddRecord = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('calories_burned')
        .insert({
          user_id: user.id,
          calories: parseInt(newRecord.calories),
          activity_type: newRecord.activity_type || null,
          duration_minutes: newRecord.duration_minutes ? parseInt(newRecord.duration_minutes) : null,
          notes: newRecord.notes || null,
          date: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Sucesso! ✅",
        description: "Registro de calorias adicionado.",
      });

      setIsAddDialogOpen(false);
      setNewRecord({ calories: "", activity_type: "", duration_minutes: "", notes: "" });
      loadUserData();
      loadWeeklyData();
    } catch (error) {
      console.error('Erro ao adicionar registro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o registro.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateGoal = async (goal: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ daily_calories_burn_goal: goal })
        .eq('user_id', user.id);

      if (error) throw error;

      setDailyGoal(goal);
      toast({
        title: "Meta Atualizada! ✅",
        description: `Nova meta: ${goal} kcal por dia.`,
      });

      setIsGoalDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a meta.",
        variant: "destructive",
      });
    }
  };

  const getPercentageChange = () => {
    if (yesterdayCalories === 0) return "+100%";
    const change = ((todayCalories - yesterdayCalories) / yesterdayCalories) * 100;
    return change >= 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
  };

  const progressPercentage = (todayCalories / dailyGoal) * 100;

  return (
    <Layout>
      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Calorias Queimadas</h1>
              <p className="text-muted-foreground">Histórico de atividades e metas</p>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="fitness" size="icon">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Atividade</DialogTitle>
                <DialogDescription>
                  Registre suas calorias queimadas hoje
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="calories">Calorias Queimadas (kcal) *</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={newRecord.calories}
                    onChange={(e) => setNewRecord({ ...newRecord, calories: e.target.value })}
                    placeholder="Ex: 350"
                  />
                </div>
                <div>
                  <Label htmlFor="activity">Tipo de Atividade</Label>
                  <Select
                    value={newRecord.activity_type}
                    onValueChange={(value) => setNewRecord({ ...newRecord, activity_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a atividade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corrida">Corrida</SelectItem>
                      <SelectItem value="caminhada">Caminhada</SelectItem>
                      <SelectItem value="ciclismo">Ciclismo</SelectItem>
                      <SelectItem value="natacao">Natação</SelectItem>
                      <SelectItem value="musculacao">Musculação</SelectItem>
                      <SelectItem value="yoga">Yoga</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newRecord.duration_minutes}
                    onChange={(e) => setNewRecord({ ...newRecord, duration_minutes: e.target.value })}
                    placeholder="Ex: 30"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Input
                    id="notes"
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                    placeholder="Ex: Treino intenso"
                  />
                </div>
                <Button 
                  onClick={handleAddRecord} 
                  className="w-full" 
                  variant="fitness"
                  disabled={!newRecord.calories}
                >
                  Adicionar Registro
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {achievements.length > 0 && (
          <Card className="glass-card border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Trophy className="w-5 h-5" />
                Conquistas de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {achievements.map((achievement, index) => (
                  <div key={index} className="text-sm font-medium text-primary animate-fade-in">
                    {achievement}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-primary">{todayCalories}</div>
                <div className="text-sm text-muted-foreground">kcal queimadas</div>
                {yesterdayCalories > 0 && (
                  <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${
                    todayCalories >= yesterdayCalories ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    {getPercentageChange()} vs ontem
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Meta Diária</span>
                  <span>{todayCalories} / {dailyGoal} kcal</span>
                </div>
                <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Histórico Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyData.map((item, index) => {
                  const percentage = (item.calories / dailyGoal) * 100;
                  const isAboveGoal = item.calories >= dailyGoal;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.day}</span>
                        <span className={`font-medium ${isAboveGoal ? 'text-green-500' : ''}`}>
                          {item.calories} kcal
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className={`h-1 ${isAboveGoal ? '[&>div]:bg-green-500' : ''}`}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Ajustar Meta</CardTitle>
              <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Meta Personalizada</DialogTitle>
                    <DialogDescription>
                      Defina uma meta personalizada de calorias diárias
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customGoal">Meta Diária (kcal)</Label>
                      <Input
                        id="customGoal"
                        type="number"
                        value={newGoal}
                        onChange={(e) => setNewGoal(parseInt(e.target.value))}
                        min="100"
                        step="50"
                      />
                    </div>
                    <Button 
                      onClick={() => handleUpdateGoal(newGoal)} 
                      className="w-full"
                      variant="fitness"
                    >
                      Salvar Meta
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sua meta atual é queimar {dailyGoal} kcal por dia. Ajuste conforme seu objetivo fitness.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant={dailyGoal === 300 ? "fitness" : "outline"} 
                  className="flex-1"
                  onClick={() => handleUpdateGoal(300)}
                >
                  300 kcal
                </Button>
                <Button 
                  variant={dailyGoal === 500 ? "fitness" : "outline"} 
                  className="flex-1"
                  onClick={() => handleUpdateGoal(500)}
                >
                  500 kcal
                </Button>
                <Button 
                  variant={dailyGoal === 700 ? "fitness" : "outline"} 
                  className="flex-1"
                  onClick={() => handleUpdateGoal(700)}
                >
                  700 kcal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CaloriesBurnedPage;
