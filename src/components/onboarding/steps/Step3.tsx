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

const Step3 = ({ data, updateData, nextStep, prevStep }: StepProps) => {
  const experiences = [
    { value: 'beginner', label: 'Iniciante', description: 'Menos de 6 meses' },
    { value: 'intermediate', label: 'Intermediário', description: '6 meses - 2 anos' },
    { value: 'advanced', label: 'Avançado', description: 'Mais de 2 anos' },
  ];

  const handleContinue = () => {
    if (!data.experience) {
      toast.error("Por favor, selecione seu nível de experiência");
      return;
    }
    nextStep();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Experiência com Musculação</h2>
        <p className="text-muted-foreground">Qual é o seu nível atual?</p>
      </div>

      <div className="space-y-3">
        {experiences.map((exp) => (
          <button
            key={exp.value}
            onClick={() => updateData({ experience: exp.value as any })}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              data.experience === exp.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold text-lg">{exp.label}</div>
            <div className="text-sm text-muted-foreground">{exp.description}</div>
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

export default Step3;
