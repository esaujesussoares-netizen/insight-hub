import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";
import { toast } from "sonner";

interface StepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const Step6 = ({ data, updateData, nextStep, prevStep }: StepProps) => {
  const focuses = [
    { value: 'balanced', label: 'Balanceado', description: 'Recomendado', recommended: true },
    { value: 'chest', label: 'Peito', description: 'Foco em peitoral' },
    { value: 'back', label: 'Costas', description: 'Foco em dorsais' },
    { value: 'arms', label: 'Braços', description: 'Bíceps e tríceps' },
    { value: 'legs', label: 'Pernas', description: 'Quadríceps e posteriores' },
    { value: 'abs', label: 'Abdômen', description: 'Core e abdominais' },
    { value: 'glutes', label: 'Glúteos', description: 'Foco em glúteos' },
  ];

  const handleContinue = () => {
    if (!data.muscleFocus) {
      toast.error("Por favor, selecione o foco muscular");
      return;
    }
    nextStep();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Foco Muscular</h2>
        <p className="text-muted-foreground">Qual grupo muscular você quer priorizar?</p>
      </div>

      <div className="space-y-2">
        {focuses.map((focus) => (
          <button
            key={focus.value}
            onClick={() => updateData({ muscleFocus: focus.value as any })}
            className={`w-full p-3 rounded-xl border-2 transition-all text-left relative ${
              data.muscleFocus === focus.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{focus.label}</div>
                <div className="text-sm text-muted-foreground">{focus.description}</div>
              </div>
              {focus.recommended && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                  Recomendado
                </span>
              )}
            </div>
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

export default Step6;
