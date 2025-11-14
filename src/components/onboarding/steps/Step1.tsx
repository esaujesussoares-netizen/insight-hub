import { Button } from "@/components/ui/button";
import { OnboardingData } from "../OnboardingFlow";

interface StepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const Step1 = ({ nextStep }: StepProps) => {
  return (
    <div className="w-full max-w-md mx-auto space-y-8 text-center animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Vamos começar</h1>
        <p className="text-lg text-muted-foreground">
          Primeiro, precisamos saber algumas informações sobre você para criar seu treino personalizado...
        </p>
      </div>

      <div className="py-8">
        <svg className="w-48 h-48 mx-auto text-primary" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="4" opacity="0.2"/>
          <path d="M100 40 L100 80 M100 120 L100 160 M40 100 L80 100 M120 100 L160 100" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="100" cy="100" r="15" fill="currentColor"/>
        </svg>
      </div>

      <Button 
        onClick={nextStep}
        size="lg"
        className="w-full gradient-hero hover:opacity-90 transition-smooth"
      >
        Começar
      </Button>
    </div>
  );
};

export default Step1;
