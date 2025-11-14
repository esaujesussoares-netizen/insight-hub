import { Button } from "@/components/ui/button";
import { ChevronLeft, Target } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";
import { toast } from "sonner";

interface StepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const Step5 = ({ data, updateData, nextStep, prevStep }: StepProps) => {
  const goals = [
    { value: 'hypertrophy', label: 'Hipertrofia', description: 'Ganhar massa muscular', icon: '💪' },
    { value: 'definition', label: 'Definição Muscular', description: 'Músculos aparentes', icon: '⚡' },
    { value: 'weight_loss', label: 'Emagrecer', description: 'Perder gordura', icon: '🔥' },
  ];

  const handleContinue = () => {
    if (!data.mainGoal) {
      toast.error("Por favor, selecione seu objetivo principal");
      return;
    }
    nextStep();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <Target className="w-12 h-12 mx-auto text-primary" />
        <h2 className="text-3xl font-bold">Objetivo Principal</h2>
        <p className="text-muted-foreground">O que você quer alcançar?</p>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => (
          <button
            key={goal.value}
            onClick={() => updateData({ mainGoal: goal.value as any })}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              data.mainGoal === goal.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{goal.icon}</span>
              <div>
                <div className="font-semibold text-lg">{goal.label}</div>
                <div className="text-sm text-muted-foreground">{goal.description}</div>
              </div>
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

export default Step5;
