import { Button } from "@/components/ui/button";
import { ChevronLeft, Heart } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";

interface StepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const Step7 = ({ data, updateData, nextStep, prevStep }: StepProps) => {
  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <Heart className="w-12 h-12 mx-auto text-primary" />
        <h2 className="text-3xl font-bold">Exercícios de Cardio</h2>
        <p className="text-muted-foreground">Deseja incluir cardio no seu treino?</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => updateData({ includeCardio: true })}
          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
            data.includeCardio === true
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="font-semibold text-lg">Sim, incluir cardio</div>
          <div className="text-sm text-muted-foreground">Esteira, bicicleta, elíptico</div>
        </button>

        <button
          onClick={() => updateData({ includeCardio: false })}
          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
            data.includeCardio === false
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="font-semibold text-lg">Não desejo cardio</div>
          <div className="text-sm text-muted-foreground">Apenas musculação</div>
        </button>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="w-full">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={nextStep} className="w-full gradient-hero hover:opacity-90 transition-smooth">
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default Step7;
