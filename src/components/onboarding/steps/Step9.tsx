import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Clock } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";
import { toast } from "sonner";

interface StepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const Step9 = ({ data, updateData, nextStep, prevStep }: StepProps) => {
  const dayLabels: Record<string, string> = {
    monday: 'Segunda',
    tuesday: 'Terça',
    wednesday: 'Quarta',
    thursday: 'Quinta',
    friday: 'Sexta',
    saturday: 'Sábado',
    sunday: 'Domingo',
  };

  const setTimeForDay = (day: string, time: string) => {
    const currentSchedule = data.trainingSchedule || {};
    updateData({
      trainingSchedule: {
        ...currentSchedule,
        [day]: time,
      },
    });
  };

  const handleContinue = () => {
    const selectedDays = data.trainingDays || [];
    const schedule = data.trainingSchedule || {};
    
    const allTimesSet = selectedDays.every(day => schedule[day]);
    
    if (!allTimesSet) {
      toast.error("Por favor, defina os horários para todos os dias");
      return;
    }
    nextStep();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <Clock className="w-12 h-12 mx-auto text-primary" />
        <h2 className="text-3xl font-bold">Horários de Treino</h2>
        <p className="text-muted-foreground">Defina o horário para cada dia</p>
      </div>

      <div className="space-y-4">
        {(data.trainingDays || []).map((day) => (
          <div key={day} className="space-y-2">
            <Label>{dayLabels[day]}</Label>
            <Input
              type="time"
              value={data.trainingSchedule?.[day] || ''}
              onChange={(e) => setTimeForDay(day, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="w-full">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handleContinue} className="w-full gradient-hero hover:opacity-90 transition-smooth">
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default Step9;
