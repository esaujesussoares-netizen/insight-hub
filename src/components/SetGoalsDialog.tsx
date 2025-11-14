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
import { Target } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SetGoalsDialogProps {
  onAddExercise: (
    exerciseName: string,
    initialWeight: number,
    targetWeight: number,
    unit: string
  ) => void;
  trigger?: React.ReactNode;
}

export const SetGoalsDialog = ({ onAddExercise, trigger }: SetGoalsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [initialWeight, setInitialWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [unit, setUnit] = useState("kg");

  const predefinedExercises = [
    "Supino Reto",
    "Agachamento",
    "Deadlift",
    "Desenvolvimento",
    "Remada",
    "Leg Press",
    "Rosca Direta",
    "Tríceps Pulley"
  ];

  const handleSubmit = () => {
    if (exerciseName && initialWeight && targetWeight) {
      onAddExercise(
        exerciseName,
        parseFloat(initialWeight),
        parseFloat(targetWeight),
        unit
      );
      setOpen(false);
      setExerciseName("");
      setInitialWeight("");
      setTargetWeight("");
      setUnit("kg");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="fitness" className="w-full mt-4">
            <Target className="w-4 h-4" />
            Definir Novas Metas
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Definir Nova Meta de Força</DialogTitle>
          <DialogDescription>
            Adicione um exercício para acompanhar seu progresso
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="exercise">Exercício</Label>
            <Select value={exerciseName} onValueChange={setExerciseName}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um exercício" />
              </SelectTrigger>
              <SelectContent>
                {predefinedExercises.map((ex) => (
                  <SelectItem key={ex} value={ex}>
                    {ex}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Personalizado...</SelectItem>
              </SelectContent>
            </Select>
            {exerciseName === "custom" && (
              <Input
                className="mt-2"
                placeholder="Nome do exercício"
                onChange={(e) => setExerciseName(e.target.value)}
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="initial">Peso Inicial</Label>
              <Input
                id="initial"
                type="number"
                step="0.5"
                value={initialWeight}
                onChange={(e) => setInitialWeight(e.target.value)}
                placeholder="60"
              />
            </div>
            <div>
              <Label htmlFor="target">Peso Meta</Label>
              <Input
                id="target"
                type="number"
                step="0.5"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="100"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="unit">Unidade</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lbs">lbs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Adicionar Meta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
