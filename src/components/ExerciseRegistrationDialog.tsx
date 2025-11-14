import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Star } from "lucide-react";
import { Exercise } from "@/database/exercises";
import { useStrengthProgress } from "@/hooks/useStrengthProgress";
import { toast } from "sonner";

interface ExerciseRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise;
}

export function ExerciseRegistrationDialog({
  isOpen,
  onClose,
  exercise,
}: ExerciseRegistrationDialogProps) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [difficulty, setDifficulty] = useState(3);
  const [notes, setNotes] = useState("");
  const { updateExerciseProgress, addNewExercise, progressData } = useStrengthProgress();

  const existingProgress = progressData.find(p => p.exercise === exercise.name);

  const handleSubmit = async () => {
    if (!weight || !reps) {
      toast.error("Preencha peso e repetições");
      return;
    }

    const weightNum = parseFloat(weight);

    if (existingProgress) {
      await updateExerciseProgress(exercise.name, weightNum);
    } else {
      // Se não existe, criar novo registro
      await addNewExercise(
        exercise.name,
        weightNum,
        weightNum * 1.5, // Meta: 50% a mais
        'kg'
      );
    }

    toast.success("Treino registrado com sucesso! 💪");
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setWeight("");
    setReps("");
    setDifficulty(3);
    setNotes("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <span>🏋️‍♂️</span>
            Registrar Treino
          </DialogTitle>
          <DialogDescription>
            {exercise.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Peso Utilizado */}
          <div className="space-y-2">
            <Label htmlFor="weight">Peso Utilizado (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="Ex: 50"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              step="0.5"
            />
            {existingProgress && (
              <p className="text-xs text-muted-foreground">
                Último registro: {existingProgress.currentWeight}kg
              </p>
            )}
          </div>

          {/* Número de Repetições */}
          <div className="space-y-2">
            <Label htmlFor="reps">Número de Repetições</Label>
            <Input
              id="reps"
              type="number"
              placeholder="Ex: 12"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: {exercise.reps}
            </p>
          </div>

          {/* Dificuldade */}
          <div className="space-y-3">
            <Label>Dificuldade</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[difficulty]}
                onValueChange={(value) => setDifficulty(value[0])}
                max={5}
                min={1}
                step={1}
                className="flex-1"
              />
              <div className="flex items-center gap-1 w-32">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < difficulty
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Fácil</span>
              <span>Difícil</span>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Como foi o treino? Sentiu alguma dor?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Salvar Treino
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
