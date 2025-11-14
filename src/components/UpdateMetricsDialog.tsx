import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp } from "lucide-react";

interface UpdateMetricsDialogProps {
  onUpdate: (metrics: {
    weight?: number;
    bodyFat?: number;
    muscleMass?: number;
  }) => void;
  trigger?: React.ReactNode;
}

export const UpdateMetricsDialog = ({ onUpdate, trigger }: UpdateMetricsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [muscleMass, setMuscleMass] = useState("");

  const handleSubmit = () => {
    const metrics: any = {};
    
    if (weight) metrics.weight = parseFloat(weight);
    if (bodyFat) metrics.bodyFat = parseFloat(bodyFat);
    if (muscleMass) metrics.muscleMass = parseFloat(muscleMass);

    if (Object.keys(metrics).length > 0) {
      onUpdate(metrics);
      setOpen(false);
      setWeight("");
      setBodyFat("");
      setMuscleMass("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <TrendingUp className="w-4 h-4" />
            Atualizar Medidas
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Métricas Corporais</DialogTitle>
          <DialogDescription>
            Registre suas novas medidas corporais
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="75.5"
            />
          </div>
          <div>
            <Label htmlFor="bodyFat">Gordura Corporal (%)</Label>
            <Input
              id="bodyFat"
              type="number"
              step="0.1"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="15.2"
            />
          </div>
          <div>
            <Label htmlFor="muscleMass">Massa Muscular (kg)</Label>
            <Input
              id="muscleMass"
              type="number"
              step="0.1"
              value={muscleMass}
              onChange={(e) => setMuscleMass(e.target.value)}
              placeholder="63.8"
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Salvar Medidas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
