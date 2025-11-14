import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { Activity, Flame, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WorkoutHistory = () => {
  const { dailyStats, weeklyStats, totalStats, loading } = useWorkoutHistory();

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Histórico de Treinos</h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Treinos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalWorkouts}</div>
              <p className="text-xs text-muted-foreground">últimos 90 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calorias Queimadas</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalCalories.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">kcal no total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalHours}h</div>
              <p className="text-xs text-muted-foreground">de exercício</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média Semanal</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.avgWorkoutsPerWeek}</div>
              <p className="text-xs text-muted-foreground">treinos/semana</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList>
            <TabsTrigger value="daily">Visão Diária</TabsTrigger>
            <TabsTrigger value="weekly">Visão Semanal</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            {/* Daily Workouts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Frequência de Treinos
                </CardTitle>
                <CardDescription>
                  Número de treinos completados por dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dailyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                        className="text-xs"
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="workouts" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="Treinos" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum treino registrado ainda.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Calories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  Calorias Queimadas
                </CardTitle>
                <CardDescription>
                  Total de calorias queimadas por dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dailyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dailyStats}>
                      <defs>
                        <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                        className="text-xs"
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#caloriesGradient)" 
                        name="Calorias"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Flame className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma caloria registrada ainda.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Duration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Duração dos Treinos
                </CardTitle>
                <CardDescription>
                  Tempo total de treino por dia (minutos)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dailyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyStats.map(d => ({ ...d, duration: Math.round(d.duration / 60) }))}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                        className="text-xs"
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="duration" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                        name="Minutos"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma duração registrada ainda.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            {/* Weekly Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Visão Semanal
                </CardTitle>
                <CardDescription>
                  Resumo de treinos por semana
                </CardDescription>
              </CardHeader>
              <CardContent>
                {weeklyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={weeklyStats}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" className="text-xs" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar 
                        yAxisId="left"
                        dataKey="workouts" 
                        fill="hsl(var(--primary))" 
                        radius={[8, 8, 0, 0]} 
                        name="Treinos"
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="avgDuration" 
                        fill="hsl(var(--secondary))" 
                        radius={[8, 8, 0, 0]} 
                        name="Duração Média (min)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum dado semanal disponível.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Calories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  Calorias por Semana
                </CardTitle>
                <CardDescription>
                  Total de calorias queimadas semanalmente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {weeklyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={weeklyStats}>
                      <defs>
                        <linearGradient id="weeklyCaloriesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" className="text-xs" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#weeklyCaloriesGradient)" 
                        name="Calorias"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Flame className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma caloria semanal registrada.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {dailyStats.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground space-y-4">
                <Activity className="h-16 w-16 mx-auto opacity-50" />
                <div>
                  <p className="text-lg font-medium">Comece sua jornada fitness!</p>
                  <p className="text-sm mt-2">
                    Complete treinos para visualizar seu histórico e estatísticas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default WorkoutHistory;
