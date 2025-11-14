import { Button } from "@/components/ui/button";
import { ChevronLeft, Calendar } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";
import { toast } from "sonner";

interface StepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const Step8 = ({ data, updateData, nextStep, prevStep }: StepProps) => {
  const days = [
    { value: 'monday', label: 'Segunda' },
    { value: 'tuesday', label: 'Terça' },
    { value: 'wednesday', label: 'Quarta' },
    { value: 'thursday', label: 'Quinta' },
    { value: 'friday', label: 'Sexta' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' },
  ];

  const toggleDay = (day: string) => {
    const currentDays = data.trainingDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    updateData({ trainingDays: newDays });
  };

  const handleContinue = () => {
    const selectedDays = data.trainingDays || [];
    if (selectedDays.length < 2 || selectedDays.length > 6) {
      toast.error("Selecione de 2 a 6 dias de treino");
      return;
    }
    nextStep();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <Calendar className="w-12 h-12 mx-auto text-primary" />
        <h2 className="text-3xl font-bold">Dias de Treino</h2>
        <p className="text-muted-foreground">Quantos dias por semana você vai treinar?</p>
        <p className="text-sm text-muted-foreground">(Selecione de 2 a 6 dias)</p>
      </div>

      <div className="space-y-2">
        {days.map((day) => (
          <button
            key={day.value}
            onClick={() => toggleDay(day.value)}
            className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
              data.trainingDays?.includes(day.value)
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold">{day.label}</div>
          </button>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {data.trainingDays?.length || 0} dia(s) selecionado(s)
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

export default Step8;
