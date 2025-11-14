import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target } from "lucide-react";

interface SetWeightGoalDialogProps {
  currentWeight: number;
  onCreate: (goal: {
    goal_type: 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'gain_muscle';
    start_weight: number;
    target_weight: number;
    target_date?: string;
  }) => void;
  trigger: React.ReactNode;
}

export const SetWeightGoalDialog = ({ currentWeight, onCreate, trigger }: SetWeightGoalDialogProps) => {
  const [open, setOpen] = useState(false);
  const [goalType, setGoalType] = useState<'lose_weight' | 'gain_weight' | 'maintain_weight' | 'gain_muscle'>('lose_weight');
  const [targetWeight, setTargetWeight] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const handleSubmit = () => {
    if (!targetWeight) return;

    onCreate({
      goal_type: goalType,
      start_weight: currentWeight,
      target_weight: parseFloat(targetWeight),
      target_date: targetDate || undefined
    });

    setOpen(false);
    setTargetWeight("");
    setTargetDate("");
    setGoalType('lose_weight');
  };

  const goalTypeLabels = {
    lose_weight: 'Perder Peso',
    gain_weight: 'Ganhar Peso',
    maintain_weight: 'Manter Peso',
    gain_muscle: 'Ganhar Massa Muscular'
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Definir Meta de Peso
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Peso Atual</p>
            <p className="text-2xl font-bold text-primary">{currentWeight.toFixed(1)} kg</p>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Meta</Label>
            <Select value={goalType} onValueChange={(value: any) => setGoalType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lose_weight">Perder Peso</SelectItem>
                <SelectItem value="gain_weight">Ganhar Peso</SelectItem>
                <SelectItem value="maintain_weight">Manter Peso</SelectItem>
                <SelectItem value="gain_muscle">Ganhar Massa Muscular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Peso Alvo (kg)</Label>
            <Input
              type="number"
              step="0.1"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder="Ex: 75.0"
            />
          </div>

          <div className="space-y-2">
            <Label>Data Alvo (Opcional)</Label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          {targetWeight && (
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Diferença</p>
              <p className="text-xl font-bold">
                {Math.abs(parseFloat(targetWeight) - currentWeight).toFixed(1)} kg
              </p>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={!targetWeight} className="w-full">
            Criar Meta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
