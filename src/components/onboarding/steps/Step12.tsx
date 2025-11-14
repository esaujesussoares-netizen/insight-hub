import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";

interface StepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const Step12 = ({ data, nextStep }: StepProps) => {
  const getGoalLabel = () => {
    const goals: Record<string, string> = {
      hypertrophy: 'Hipertrofia',
      definition: 'Definição',
      weight_loss: 'Emagrecimento',
    };
    return goals[data.mainGoal || 'hypertrophy'];
  };

  const getFocusLabel = () => {
    const focuses: Record<string, string> = {
      balanced: 'Balanceado',
      chest: 'Peito',
      back: 'Costas',
      arms: 'Braços',
      legs: 'Pernas',
      abs: 'Abdômen',
      glutes: 'Glúteos',
    };
    return focuses[data.muscleFocus || 'balanced'];
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8 animate-fade-in text-center">
      <div className="space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">Treino Personalizado Criado!</h2>
        <p className="text-muted-foreground">Seu programa está pronto para começar</p>
      </div>

      <div className="space-y-4">
        <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5">
          <h3 className="text-xl font-bold mb-4">
            {getGoalLabel()} - {getFocusLabel()}
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <span className="font-semibold">Fase 1: Resistência</span>
              <span className="text-sm text-muted-foreground">4 semanas</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <span className="font-semibold">Fase 2: Força</span>
              <span className="text-sm text-muted-foreground">4 semanas</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <span className="font-semibold">Fase 3: Hipertrofia</span>
              <span className="text-sm text-muted-foreground">4 semanas</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl border border-border bg-card text-left">
            <div className="text-2xl font-bold text-primary">{data.trainingDays?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Dias por semana</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card text-left">
            <div className="text-2xl font-bold text-primary">{data.includeCardio ? 'Sim' : 'Não'}</div>
            <div className="text-sm text-muted-foreground">Cardio incluído</div>
          </div>
        </div>
      </div>

      <Button onClick={nextStep} size="lg" className="w-full gradient-hero hover:opacity-90 transition-smooth">
        Ir para o Dashboard
      </Button>
    </div>
  );
};

export default Step12;
