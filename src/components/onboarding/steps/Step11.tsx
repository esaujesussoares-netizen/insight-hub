import { useEffect, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";

interface StepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const Step11 = ({ nextStep }: StepProps) => {
  const [currentTask, setCurrentTask] = useState(0);
  
  const tasks = [
    "Calculando objetivos de treino",
    "Criando catálogo de exercícios personalizados",
    "Preparando programas de treino",
    "Finalizando personalização",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTask((prev) => {
        if (prev < tasks.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => nextStep(), 1000);
          return prev;
        }
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [nextStep]);

  return (
    <div className="w-full max-w-md mx-auto space-y-8 animate-fade-in text-center">
      <div className="space-y-4">
        <div className="relative w-24 h-24 mx-auto">
          <Loader2 className="w-24 h-24 text-primary animate-spin" />
        </div>
        <h2 className="text-3xl font-bold">Criando seu Treino Personalizado</h2>
        <p className="text-muted-foreground">Aguarde enquanto preparamos tudo para você...</p>
      </div>

      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border transition-all ${
              index < currentTask
                ? 'border-primary bg-primary/5'
                : index === currentTask
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center gap-3">
              {index < currentTask ? (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              ) : index === currentTask ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
              )}
              <span className={index <= currentTask ? 'font-semibold' : 'text-muted-foreground'}>
                {task}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Step11;
