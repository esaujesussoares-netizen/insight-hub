import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, TrendingUp, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const WorkoutTimePage = () => {
  const navigate = useNavigate();

  const weeklyData = [
    { day: "Seg", minutes: 50, exercises: 8 },
    { day: "Ter", minutes: 45, exercises: 7 },
    { day: "Qua", minutes: 0, exercises: 0 },
    { day: "Qui", minutes: 55, exercises: 9 },
    { day: "Sex", minutes: 45, exercises: 7 },
    { day: "Sáb", minutes: 60, exercises: 10 },
    { day: "Dom", minutes: 30, exercises: 5 },
  ];

  const recentSessions = [
    { date: "Hoje", type: "Peito e Tríceps", duration: 45, completed: true },
    { date: "Ontem", type: "Costas e Bíceps", duration: 50, completed: true },
    { date: "3 dias atrás", type: "Pernas", duration: 60, completed: true },
  ];

  const totalWeeklyMinutes = weeklyData.reduce((acc, day) => acc + day.minutes, 0);
  const weeklyGoal = 300;

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
            <h1 className="text-3xl font-bold">Tempo de Treino</h1>
            <p className="text-muted-foreground">Estatísticas e histórico de sessões</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-primary">45min</div>
                <div className="text-sm text-muted-foreground">tempo de treino</div>
                <div className="text-xs text-green-500 mt-1 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Excelente ritmo!
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Resumo Semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 rounded-lg bg-gradient-fitness-subtle">
                <div className="text-3xl font-bold text-primary">{totalWeeklyMinutes}min</div>
                <div className="text-sm text-muted-foreground">tempo total esta semana</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Meta Semanal</span>
                  <span>{totalWeeklyMinutes} / {weeklyGoal} min</span>
                </div>
                <Progress value={(totalWeeklyMinutes / weeklyGoal) * 100} className="h-2" />
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
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{item.day}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.exercises > 0 ? `${item.exercises} exercícios` : 'Descanso'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{item.minutes}min</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Sessões Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSessions.map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="font-medium">{session.type}</p>
                      <p className="text-xs text-muted-foreground">{session.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{session.duration}min</p>
                      {session.completed && (
                        <p className="text-xs text-green-500">✓ Completo</p>
                      )}
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

export default WorkoutTimePage;
