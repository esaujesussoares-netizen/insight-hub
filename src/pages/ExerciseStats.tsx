import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useExerciseStats } from "@/hooks/useExerciseStats";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { Activity, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ExerciseStats = () => {
  const { topExercises, exerciseProgress, loading } = useExerciseStats();

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
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
          <h1 className="text-3xl font-bold">Estatísticas de Exercícios</h1>
        </div>

        {/* Top Exercises */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Exercícios Mais Realizados
            </CardTitle>
            <CardDescription>
              Os 10 exercícios que você mais praticou
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topExercises.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topExercises}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="exercise_name" 
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    className="text-xs"
                  />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum exercício registrado ainda.</p>
                <p className="text-sm mt-2">Comece a treinar para ver suas estatísticas!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercise Progress */}
        {exerciseProgress.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Evolução de Carga
              </CardTitle>
              <CardDescription>
                Acompanhe seu progresso nos principais exercícios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {exerciseProgress.map((exercise) => (
                <div key={exercise.exercise_name}>
                  <h3 className="font-semibold mb-4 text-lg">{exercise.exercise_name}</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={exercise.data}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs"
                      />
                      <YAxis 
                        label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                        name="Peso"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {topExercises.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground space-y-4">
                <Activity className="h-16 w-16 mx-auto opacity-50" />
                <div>
                  <p className="text-lg font-medium">Comece sua jornada fitness!</p>
                  <p className="text-sm mt-2">
                    Complete treinos e registre seus exercícios para visualizar estatísticas detalhadas.
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

export default ExerciseStats;
