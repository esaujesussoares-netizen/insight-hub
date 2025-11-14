import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBodyMetrics } from "@/hooks/useBodyMetrics";
import { useBodyMeasurements } from "@/hooks/useBodyMeasurements";
import { useAdvancedMetrics } from "@/hooks/useAdvancedMetrics";
import { useBodyPhotos } from "@/hooks/useBodyPhotos";
import { useWeightGoals } from "@/hooks/useWeightGoals";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/untyped";
import { UpdateMetricsDialog } from "./UpdateMetricsDialog";
import { AddMeasurementsDialog } from "./AddMeasurementsDialog";
import { AddAdvancedMetricsDialog } from "./AddAdvancedMetricsDialog";
import { AddBodyPhotoDialog } from "./AddBodyPhotoDialog";
import { SetWeightGoalDialog } from "./SetWeightGoalDialog";
import { BodyProgressReportDialog } from "./BodyProgressReportDialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Calendar, Image, Plus, Trash2, Target, TrendingDown, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BodyMetricHistory {
  id: string;
  weight: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  bmi?: number;
  measurement_date: string;
}

export const BodyMetricsView = () => {
  const { user } = useAuth();
  const { bodyMetrics, updateBodyMetrics, refreshData } = useBodyMetrics();
  const { measurements, addMeasurement, deleteMeasurement } = useBodyMeasurements();
  const { metrics, addMetric, deleteMetric } = useAdvancedMetrics();
  const { photos, uploadPhoto, deletePhoto } = useBodyPhotos();
  const { activeGoal, createGoal, updateGoalProgress } = useWeightGoals();
  const [history, setHistory] = useState<BodyMetricHistory[]>([]);
  
  // === MODIFICAÇÃO: Adicionar estado para dados do perfil ===
  const [profileData, setProfileData] = useState<{
    weight: number | null;
    height: number | null;
  }>({ weight: null, height: null });

  useEffect(() => {
    loadHistory();
    loadProfileData();
  }, [user]);

  // === MODIFICAÇÃO: Carregar dados do perfil ===
  const loadProfileData = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('weight, height')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setProfileData({
        weight: data.weight,
        height: data.height
      });
    }
  };

  const loadHistory = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('measurement_date', { ascending: false })
      .limit(30);

    if (data) {
      setHistory(data);
    }
  };

  const deleteEntry = async (id: string) => {
    await supabase
      .from('body_metrics')
      .delete()
      .eq('id', id);
    
    loadHistory();
    refreshData();
  };

  const handleUpdateMetrics = async (metrics: any) => {
    await updateBodyMetrics(metrics, (newWeight) => {
      if (activeGoal) {
        updateGoalProgress(activeGoal.id, newWeight);
      }
    });
    loadHistory();
    loadProfileData(); // === MODIFICAÇÃO: Recarregar dados do perfil ===
  };

  // Preparar dados do gráfico
  const chartData = history
    .slice(0, 10)
    .reverse()
    .map(item => ({
      date: format(new Date(item.measurement_date), 'dd MMM', { locale: ptBR }),
      weight: Number(item.weight),
      fullDate: item.measurement_date
    }));

  // === MODIFICAÇÃO: Usar dados do perfil em vez de body_metrics ===
  const currentWeight = profileData.weight || bodyMetrics?.weight || 76;
  const goalWeight = activeGoal?.target_weight || 96;
  const weightDifference = goalWeight - currentWeight;
  
  // Calcular IMC usando altura do perfil
  const heightInMeters = profileData.height ? profileData.height / 100 : 1.70; // Converter cm para metros
  const bmi = bodyMetrics?.bmi || (currentWeight / (heightInMeters * heightInMeters));
  
  // Calcular peso ideal (baseado em IMC 18.5-25)
  const minIdealWeight = 18.5 * heightInMeters * heightInMeters;
  const maxIdealWeight = 25 * heightInMeters * heightInMeters;

  const latestEntry = history[0];
  const latestDate = latestEntry 
    ? format(new Date(latestEntry.measurement_date), "d 'de' MMM 'de' yyyy", { locale: ptBR })
    : format(new Date(), "d 'de' MMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="space-y-6">
      {/* Título e Botão de Relatório */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Corpo</h1>
        <BodyProgressReportDialog />
      </div>

      {/* Card do Usuário/Peso Atual */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {/* Silhueta do corpo */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-48 bg-muted rounded-lg flex items-center justify-center">
                <svg
                  viewBox="0 0 100 200"
                  className="w-full h-full text-muted-foreground/30"
                  fill="currentColor"
                >
                  {/* Cabeça */}
                  <ellipse cx="50" cy="25" rx="12" ry="15" />
                  {/* Pescoço */}
                  <rect x="47" y="38" width="6" height="8" />
                  {/* Torso */}
                  <path d="M 35 46 L 35 100 L 40 110 L 40 140 L 45 145 L 55 145 L 60 140 L 60 110 L 65 100 L 65 46 Z" />
                  {/* Braços */}
                  <rect x="25" y="50" width="8" height="45" rx="4" />
                  <rect x="67" y="50" width="8" height="45" rx="4" />
                  {/* Pernas */}
                  <rect x="40" y="145" width="8" height="50" rx="4" />
                  <rect x="52" y="145" width="8" height="50" rx="4" />
                </svg>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="absolute bottom-2 right-2 h-8 w-8 bg-background/80"
              >
                <Image className="h-4 w-4 text-primary" />
              </Button>
            </div>

            {/* Peso e Data */}
            <div className="flex-1 space-y-2">
              <div className="text-4xl font-bold text-primary">
                {currentWeight.toFixed(1)} kg
              </div>
              <div className="text-sm text-muted-foreground">
                {latestDate}
              </div>
            </div>

            {/* Botão Adicionar */}
            <UpdateMetricsDialog 
              onUpdate={handleUpdateMetrics}
              trigger={
                <Button size="icon" variant="outline" className="h-20 w-20">
                  <Plus className="h-6 w-6" />
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Navegação */}
      <Tabs defaultValue="peso" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="peso">Peso</TabsTrigger>
          <TabsTrigger value="medidas">Medidas</TabsTrigger>
          <TabsTrigger value="avancado">Avançado</TabsTrigger>
        </TabsList>

        <TabsContent value="peso" className="space-y-6 mt-6">
          {/* Módulo de Gráfico */}
          <Card>
            <CardContent className="pt-6">
              {/* Indicadores */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Atual
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {currentWeight.toFixed(1)} <span className="text-sm">kg</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Meta
                  </div>
                  <div className="text-2xl font-bold text-blue-500">
                    {goalWeight.toFixed(1)} <span className="text-sm">kg</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Diferença</div>
                  <div className="text-2xl font-bold">
                    {weightDifference > 0 ? '+' : ''}{weightDifference.toFixed(1)} <span className="text-sm">kg</span>
                  </div>
                </div>
              </div>

              {/* Gráfico */}
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    domain={[50, 130]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <ReferenceLine 
                    y={goalWeight} 
                    stroke="rgb(59, 130, 246)" 
                    strokeDasharray="3 3"
                    label={{ value: `${goalWeight} kg`, position: 'right', fill: 'rgb(59, 130, 246)' }}
                  />
                  <ReferenceLine 
                    y={minIdealWeight} 
                    stroke="hsl(var(--primary))" 
                    strokeDasharray="3 3"
                    strokeOpacity={0.3}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Módulo de Diagnóstico */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Diagnóstico</CardTitle>
                <Button variant="link" className="text-primary">Ver mais</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">IMC</div>
                  <div className="text-3xl font-bold">{bmi.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Gordura</div>
                  <div className="text-3xl font-bold">
                    {(bodyMetrics?.bodyFat || 18.83).toFixed(2)} <span className="text-lg">%</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Peso Ideal</div>
                  <div className="text-3xl font-bold">
                    {minIdealWeight.toFixed(0)}-{maxIdealWeight.toFixed(0)} <span className="text-lg">kg</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Módulo de Histórico */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Histórico</CardTitle>
                <UpdateMetricsDialog 
                  onUpdate={handleUpdateMetrics}
                  trigger={
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </Button>
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {format(new Date(entry.measurement_date), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Number(entry.weight).toFixed(1)} kg
                        </div>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhum registro ainda. Adicione sua primeira medição!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medidas" className="space-y-6 mt-6">
          {/* Fotos de Progresso */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fotos de Progresso</CardTitle>
                <AddBodyPhotoDialog
                  onUpload={uploadPhoto}
                  trigger={
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Foto
                    </Button>
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.photo_url}
                        alt={`Foto ${photo.photo_type}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => deletePhoto(photo.id, photo.photo_url)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <Badge className="bg-background/80 text-foreground">
                          {photo.photo_type === 'front' ? 'Frontal' : photo.photo_type === 'back' ? 'Costas' : 'Lateral'}
                        </Badge>
                        {photo.weight_at_photo && (
                          <Badge className="bg-background/80 text-foreground ml-2">
                            {photo.weight_at_photo} kg
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  Adicione fotos para acompanhar seu progresso visual
                </div>
              )}
            </CardContent>
          </Card>

          {/* Circunferências e Dobras Cutâneas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Medidas Corporais</CardTitle>
                <AddMeasurementsDialog
                  onAdd={addMeasurement}
                  trigger={
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </Button>
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              {measurements.length > 0 ? (
                <div className="space-y-3">
                  {measurements.map((measurement) => (
                    <div
                      key={measurement.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {format(new Date(measurement.measurement_date), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {measurement.waist && `Cintura: ${measurement.waist}cm`}
                            {measurement.chest && ` • Peito: ${measurement.chest}cm`}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMeasurement(measurement.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Nenhuma medida registrada ainda
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avancado" className="space-y-6 mt-6">
          {/* Meta de Peso */}
          {activeGoal && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">Meta Ativa</h3>
                      <Badge variant="outline">
                        {activeGoal.goal_type === 'lose_weight' ? 'Perder Peso' : 
                         activeGoal.goal_type === 'gain_weight' ? 'Ganhar Peso' : 
                         activeGoal.goal_type === 'gain_muscle' ? 'Ganhar Massa' : 'Manter Peso'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Início</p>
                        <p className="text-lg font-bold">{activeGoal.start_weight} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Atual</p>
                        <p className="text-lg font-bold text-primary">{activeGoal.current_weight} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Meta</p>
                        <p className="text-lg font-bold text-blue-500">{activeGoal.target_weight} kg</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Progresso</span>
                        <span className="text-sm font-medium">
                          {Math.abs(activeGoal.current_weight - activeGoal.start_weight).toFixed(1)} / {Math.abs(activeGoal.target_weight - activeGoal.start_weight).toFixed(1)} kg
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (Math.abs(activeGoal.current_weight - activeGoal.start_weight) / Math.abs(activeGoal.target_weight - activeGoal.start_weight)) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!activeGoal && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Defina sua Meta de Peso</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Crie uma meta personalizada e receba alertas quando atingir marcos importantes
                  </p>
                  <SetWeightGoalDialog
                    currentWeight={currentWeight}
                    onCreate={createGoal}
                    trigger={
                      <Button className="gap-2">
                        <Target className="h-4 w-4" />
                        Criar Meta
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Métricas Avançadas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Métricas Avançadas</CardTitle>
                <AddAdvancedMetricsDialog
                  onAdd={addMetric}
                  trigger={
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </Button>
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              {metrics.length > 0 ? (
                <div className="space-y-4">
                  {metrics.slice(0, 1).map((metric) => (
                    <div key={metric.id}>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {metric.basal_metabolic_rate && (
                          <div className="text-center p-4 rounded-lg bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">TMB</p>
                            <p className="text-2xl font-bold">{metric.basal_metabolic_rate}</p>
                            <p className="text-xs text-muted-foreground">kcal/dia</p>
                          </div>
                        )}
                        {metric.body_water_percentage && (
                          <div className="text-center p-4 rounded-lg bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">Água Corporal</p>
                            <p className="text-2xl font-bold">{metric.body_water_percentage}%</p>
                          </div>
                        )}
                        {metric.bone_mass && (
                          <div className="text-center p-4 rounded-lg bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">Massa Óssea</p>
                            <p className="text-2xl font-bold">{metric.bone_mass}</p>
                            <p className="text-xs text-muted-foreground">kg</p>
                          </div>
                        )}
                        {metric.visceral_fat && (
                          <div className="text-center p-4 rounded-lg bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">Gordura Visceral</p>
                            <p className="text-2xl font-bold">{metric.visceral_fat}</p>
                            <p className="text-xs text-muted-foreground">nível</p>
                          </div>
                        )}
                        {metric.metabolic_age && (
                          <div className="text-center p-4 rounded-lg bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-1">Idade Metabólica</p>
                            <p className="text-2xl font-bold">{metric.metabolic_age}</p>
                            <p className="text-xs text-muted-foreground">anos</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{format(new Date(metric.measurement_date), "d 'de' MMM 'de' yyyy", { locale: ptBR })}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMetric(metric.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Nenhuma métrica avançada registrada ainda
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
