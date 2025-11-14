import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddAdvancedMetricsDialogProps {
  onAdd: (metrics: any) => void;
  trigger: React.ReactNode;
}

export const AddAdvancedMetricsDialog = ({ onAdd, trigger }: AddAdvancedMetricsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [metrics, setMetrics] = useState({
    basal_metabolic_rate: "",
    body_water_percentage: "",
    bone_mass: "",
    visceral_fat: "",
    metabolic_age: "",
    notes: ""
  });

  const handleSubmit = () => {
    const formattedData: any = { notes: metrics.notes };
    
    if (metrics.basal_metabolic_rate) formattedData.basal_metabolic_rate = parseFloat(metrics.basal_metabolic_rate);
    if (metrics.body_water_percentage) formattedData.body_water_percentage = parseFloat(metrics.body_water_percentage);
    if (metrics.bone_mass) formattedData.bone_mass = parseFloat(metrics.bone_mass);
    if (metrics.visceral_fat) formattedData.visceral_fat = parseFloat(metrics.visceral_fat);
    if (metrics.metabolic_age) formattedData.metabolic_age = parseInt(metrics.metabolic_age);

    onAdd(formattedData);
    setOpen(false);
    setMetrics({
      basal_metabolic_rate: "",
      body_water_percentage: "",
      bone_mass: "",
      visceral_fat: "",
      metabolic_age: "",
      notes: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Métricas Avançadas</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Taxa Metabólica Basal (kcal/dia)</Label>
            <Input
              type="number"
              value={metrics.basal_metabolic_rate}
              onChange={(e) => setMetrics({...metrics, basal_metabolic_rate: e.target.value})}
              placeholder="Ex: 1800"
            />
          </div>

          <div className="space-y-2">
            <Label>Percentual de Água Corporal (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={metrics.body_water_percentage}
              onChange={(e) => setMetrics({...metrics, body_water_percentage: e.target.value})}
              placeholder="Ex: 60.5"
            />
          </div>

          <div className="space-y-2">
            <Label>Massa Óssea (kg)</Label>
            <Input
              type="number"
              step="0.1"
              value={metrics.bone_mass}
              onChange={(e) => setMetrics({...metrics, bone_mass: e.target.value})}
              placeholder="Ex: 3.2"
            />
          </div>

          <div className="space-y-2">
            <Label>Gordura Visceral (nível 1-59)</Label>
            <Input
              type="number"
              value={metrics.visceral_fat}
              onChange={(e) => setMetrics({...metrics, visceral_fat: e.target.value})}
              placeholder="Ex: 8"
            />
          </div>

          <div className="space-y-2">
            <Label>Idade Metabólica (anos)</Label>
            <Input
              type="number"
              value={metrics.metabolic_age}
              onChange={(e) => setMetrics({...metrics, metabolic_age: e.target.value})}
              placeholder="Ex: 28"
            />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={metrics.notes}
              onChange={(e) => setMetrics({...metrics, notes: e.target.value})}
              placeholder="Adicione observações..."
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Salvar Métricas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
