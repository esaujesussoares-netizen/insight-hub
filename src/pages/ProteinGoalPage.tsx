import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Target, TrendingUp, TrendingDown, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useMacroTracking } from "@/hooks/useMacroTracking";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/untyped";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const ProteinGoalPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    todayMacros, 
    yesterdayMacros, 
    macroGoals, 
    weeklyData, 
    loading, 
    getPercentageChange,
    refreshData 
  } = useMacroTracking();

  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [newGoals, setNewGoals] = useState({
    protein: macroGoals.protein,
    carbs: macroGoals.carbs,
    fat: macroGoals.fat,
  });

  const handleUpdateGoals = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          daily_protein_goal: newGoals.protein,
          daily_carbs_goal: newGoals.carbs,
          daily_fat_goal: newGoals.fat,
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Metas Atualizadas! ✅",
        description: "Suas metas de macronutrientes foram atualizadas.",
      });

      setIsGoalDialogOpen(false);
      refreshData();
    } catch (error) {
      console.error('Erro ao atualizar metas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as metas.",
        variant: "destructive",
      });
    }
  };

  const proteinChange = getPercentageChange(todayMacros.protein, yesterdayMacros.protein);

  if (loading) {
    return (
      <Layout>
        <div className="p-4 space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

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
              <h1 className="text-3xl font-bold">Metas de Macronutrientes</h1>
              <p className="text-muted-foreground">Acompanhe sua ingestão diária</p>
            </div>
          </div>
          
          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Edit className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajustar Metas de Macros</DialogTitle>
                <DialogDescription>
                  Defina suas metas diárias de macronutrientes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="protein">Proteína (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    value={newGoals.protein}
                    onChange={(e) => setNewGoals({ ...newGoals, protein: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="carbs">Carboidratos (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={newGoals.carbs}
                    onChange={(e) => setNewGoals({ ...newGoals, carbs: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="fat">Gorduras (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    value={newGoals.fat}
                    onChange={(e) => setNewGoals({ ...newGoals, fat: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <Button onClick={handleUpdateGoals} className="w-full">
                  Salvar Metas
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-secondary" />
                Macros de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-secondary">{Math.round(todayMacros.protein)}g</div>
                <div className="text-sm text-muted-foreground">Proteína</div>
                {proteinChange !== 0 && (
                  <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${proteinChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {proteinChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {proteinChange > 0 ? '+' : ''}{proteinChange}% vs ontem
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Proteína</span>
                    <span>{Math.round(todayMacros.protein)}g / {macroGoals.protein}g</span>
                  </div>
                  <Progress 
                    value={(todayMacros.protein / macroGoals.protein) * 100} 
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Carboidratos</span>
                    <span>{Math.round(todayMacros.carbs)}g / {macroGoals.carbs}g</span>
                  </div>
                  <Progress 
                    value={(todayMacros.carbs / macroGoals.carbs) * 100} 
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Gorduras</span>
                    <span>{Math.round(todayMacros.fat)}g / {macroGoals.fat}g</span>
                  </div>
                  <Progress 
                    value={(todayMacros.fat / macroGoals.fat) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Histórico Semanal - Proteína</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyData.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium">{item.day}</div>
                    <div className="flex-1">
                      <Progress value={(item.protein / macroGoals.protein) * 100} className="h-2" />
                    </div>
                    <div className="text-sm font-medium w-24 text-right">
                      {Math.round(item.protein)}g / {macroGoals.protein}g
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProteinGoalPage;
