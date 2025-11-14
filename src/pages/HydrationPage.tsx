import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Droplets, Plus, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { toast } from "sonner";

const HydrationPage = () => {
  const navigate = useNavigate();
  const [waterConsumed, setWaterConsumed] = useState(1.8);
  const dailyGoal = 3.0;

  const addWater = (amount: number) => {
    const newTotal = Math.min(waterConsumed + amount, dailyGoal * 1.5);
    setWaterConsumed(Number(newTotal.toFixed(1)));
    toast.success(`+${amount}L adicionado!`);
  };

  const weeklyData = [
    { day: "Seg", liters: 2.8, goal: 3.0 },
    { day: "Ter", liters: 3.2, goal: 3.0 },
    { day: "Qua", liters: 2.5, goal: 3.0 },
    { day: "Qui", liters: 3.0, goal: 3.0 },
    { day: "Sex", liters: 2.7, goal: 3.0 },
    { day: "Sáb", liters: 3.5, goal: 3.0 },
    { day: "Dom", liters: 2.2, goal: 3.0 },
  ];

  return (
    <Layout>
      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Hidratação</h1>
            <p className="text-muted-foreground">Registre sua ingestão de água</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-blue-500">{waterConsumed}L</div>
                <div className="text-sm text-muted-foreground">de {dailyGoal}L</div>
                <div className="text-xs text-green-500 mt-1 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +5% vs ontem
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso Diário</span>
                    <span>{((waterConsumed / dailyGoal) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={(waterConsumed / dailyGoal) * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => addWater(0.2)}
                    className="flex flex-col h-auto py-3"
                  >
                    <Plus className="w-4 h-4 mb-1" />
                    <span className="text-xs">200ml</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addWater(0.3)}
                    className="flex flex-col h-auto py-3"
                  >
                    <Plus className="w-4 h-4 mb-1" />
                    <span className="text-xs">300ml</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addWater(0.5)}
                    className="flex flex-col h-auto py-3"
                  >
                    <Plus className="w-4 h-4 mb-1" />
                    <span className="text-xs">500ml</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Histórico Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.day}</span>
                      <span className="font-medium">{item.liters}L / {item.goal}L</span>
                    </div>
                    <Progress 
                      value={(item.liters / item.goal) * 100} 
                      className="h-1"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Dicas de Hidratação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                💧 Beba um copo de água ao acordar
              </p>
              <p className="text-sm text-muted-foreground">
                ⏰ Configure lembretes a cada 2 horas
              </p>
              <p className="text-sm text-muted-foreground">
                🏋️ Hidrate-se antes, durante e depois do treino
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default HydrationPage;
