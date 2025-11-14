import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBodyProgressReport } from "@/hooks/useBodyProgressReport";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { FileText, TrendingDown, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PhotoComparisonOverlay } from "@/components/PhotoComparisonOverlay";

interface BodyProgressReportDialogProps {
  trigger?: React.ReactNode;
}

export const BodyProgressReportDialog = ({ trigger }: BodyProgressReportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const { progressData, summary, loading, loadProgressData } = useBodyProgressReport();

  useEffect(() => {
    if (open) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      loadProgressData(startDate, endDate);
    }
  }, [open, period]);

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd/MM', { locale: ptBR });
  };

  const formatChange = (value: number, unit: string = 'kg', decimals: number = 1) => {
    const formatted = Math.abs(value).toFixed(decimals);
    const sign = value >= 0 ? '+' : '-';
    return `${sign}${formatted}${unit}`;
  };

  // Preparar dados para gráficos
  const weightChartData = progressData.weight.map(w => ({
    date: formatDate(w.date),
    Peso: w.value,
  }));

  const bodyCompositionData = progressData.weight.map((w, idx) => ({
    date: formatDate(w.date),
    Peso: w.value,
    'Gordura (%)': progressData.bodyFat[idx]?.value || null,
    'Músculo (kg)': progressData.muscleMass[idx]?.value || null,
  }));

  const measurementsChartData = progressData.measurements.chest.map((_, idx) => ({
    date: formatDate(progressData.measurements.chest[idx]?.date || new Date().toISOString()),
    Peito: progressData.measurements.chest[idx]?.value || null,
    Cintura: progressData.measurements.waist[idx]?.value || null,
    Quadril: progressData.measurements.hips[idx]?.value || null,
  }));

  // Fotos do início e fim do período
  const firstPhoto = progressData.photos[0];
  const lastPhoto = progressData.photos[progressData.photos.length - 1];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            Relatório de Progresso
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Relatório de Progresso Corporal
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Carregando dados...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Seletor de Período */}
            <div className="flex gap-2">
              <Button
                variant={period === 7 ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(7)}
              >
                7 dias
              </Button>
              <Button
                variant={period === 30 ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(30)}
              >
                30 dias
              </Button>
              <Button
                variant={period === 90 ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(90)}
              >
                90 dias
              </Button>
            </div>

            {/* Resumo de Mudanças */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Peso</div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {formatChange(summary.weightChange)}
                    {summary.weightChange < 0 ? (
                      <TrendingDown className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Gordura</div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {formatChange(summary.bodyFatChange, '%')}
                    {summary.bodyFatChange < 0 ? (
                      <TrendingDown className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Músculo</div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {formatChange(summary.muscleMassChange)}
                    {summary.muscleMassChange > 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">IMC</div>
                  <div className="text-2xl font-bold">
                    {formatChange(summary.bmiChange, '', 2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comparação de Fotos */}
            {firstPhoto && lastPhoto && (
              <PhotoComparisonOverlay
                firstPhoto={{
                  url: firstPhoto.url,
                  date: format(new Date(firstPhoto.date), "d 'de' MMM", { locale: ptBR }),
                  weight: firstPhoto.weight,
                }}
                lastPhoto={{
                  url: lastPhoto.url,
                  date: format(new Date(lastPhoto.date), "d 'de' MMM", { locale: ptBR }),
                  weight: lastPhoto.weight,
                }}
              />
            )}

            {/* Gráficos */}
            <Tabs defaultValue="weight" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="weight">Peso</TabsTrigger>
                <TabsTrigger value="composition">Composição</TabsTrigger>
                <TabsTrigger value="measurements">Medidas</TabsTrigger>
              </TabsList>

              <TabsContent value="weight" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Evolução do Peso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {weightChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={weightChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="Peso"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ fill: "hsl(var(--primary))" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Sem dados de peso no período
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="composition" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Composição Corporal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bodyCompositionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={bodyCompositionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="Peso"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="Gordura (%)"
                            stroke="hsl(var(--destructive))"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="Músculo (kg)"
                            stroke="hsl(24 100% 50%)"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Sem dados de composição no período
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="measurements" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Medidas Corporais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {measurementsChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={measurementsChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="Peito"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="Cintura"
                            stroke="hsl(var(--destructive))"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="Quadril"
                            stroke="hsl(var(--accent))"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Sem dados de medidas no período
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
