import { Button } from "@/components/ui/button";
import { ChevronLeft, Dumbbell } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";
import { toast } from "sonner";

interface StepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const Step4 = ({ data, updateData, nextStep, prevStep }: StepProps) => {
  const gymTypes = [
    { value: 'basic', label: 'Academia Básica', description: 'Equipamentos simples e essenciais' },
    { value: 'advanced', label: 'Academia Avançada', description: 'Equipamentos completos e modernos' },
  ];

  const handleContinue = () => {
    if (!data.gymType) {
      toast.error("Por favor, selecione o tipo de academia");
      return;
    }
    nextStep();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <Dumbbell className="w-12 h-12 mx-auto text-primary" />
        <h2 className="text-3xl font-bold">Local de Treino</h2>
        <p className="text-muted-foreground">Onde você vai treinar?</p>
      </div>

      <div className="space-y-3">
        {gymTypes.map((gym) => (
          <button
            key={gym.value}
            onClick={() => updateData({ gymType: gym.value as any })}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              data.gymType === gym.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold text-lg">{gym.label}</div>
            <div className="text-sm text-muted-foreground">{gym.description}</div>
          </button>
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

export default Step4;
