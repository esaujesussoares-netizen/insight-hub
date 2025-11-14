import { Button } from "@/components/ui/button";
import { ChevronLeft, Smartphone } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";

interface StepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const Step10 = ({ nextStep, prevStep }: StepProps) => {
  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in text-center">
      <div className="space-y-4">
        <Smartphone className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-3xl font-bold">Utilize o nPnG JM</h2>
        <p className="text-muted-foreground">
          Durante seus treinos, use o aplicativo para:
        </p>
      </div>

      <div className="space-y-3 text-left">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
            <div>
              <div className="font-semibold">Acompanhar exercícios</div>
              <div className="text-sm text-muted-foreground">Veja todos os exercícios do dia</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
            <div>
              <div className="font-semibold">Registrar séries e repetições</div>
              <div className="text-sm text-muted-foreground">Anote seu progresso</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
            <div>
              <div className="font-semibold">Ver seu desempenho</div>
              <div className="text-sm text-muted-foreground">Acompanhe sua evolução</div>
            </div>
          </div>
        </div>
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

export default Step10;
