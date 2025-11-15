import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/untyped";
import ProgressIndicator from "./ProgressIndicator";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";
import Step6 from "./steps/Step6";
import Step7 from "./steps/Step7";
import Step8 from "./steps/Step8";
import Step9 from "./steps/Step9";
import Step10 from "./steps/Step10";
import Step11 from "./steps/Step11";
import Step12 from "./steps/Step12";

export interface OnboardingData {
  authMethod?: 'google' | 'facebook' | 'email' | 'guest';
  name?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  weight?: number;
  height?: number;
  goalWeight?: number;
  weightUnit?: 'kg' | 'lbs';
  heightUnit?: 'cm' | 'ft/in';
  experience?: 'beginner' | 'intermediate' | 'advanced';
  gymType?: 'basic' | 'advanced';
  mainGoal?: 'hypertrophy' | 'definition' | 'weight_loss';
  muscleFocus?: 'balanced' | 'chest' | 'back' | 'arms' | 'legs' | 'abs' | 'glutes';
  includeCardio?: boolean;
  trainingDays?: string[];
  trainingSchedule?: Record<string, string>;
  hasCompletedOnboarding?: boolean;
}

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({});
  const navigate = useNavigate();
  const { user } = useAuth();

  const totalSteps = 12;

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const fillDemoData = async () => {
    const demoData: OnboardingData = {
      name: "Demo User",
      gender: "male",
      birthDate: "1990-01-15",
      weight: 75,
      height: 175,
      goalWeight: 70,
      weightUnit: "kg",
      heightUnit: "cm",
      experience: "intermediate",
      gymType: "advanced",
      mainGoal: "hypertrophy",
      muscleFocus: "balanced",
      includeCardio: true,
      trainingDays: ["monday", "wednesday", "friday"],
      trainingSchedule: {
        monday: "18:00",
        wednesday: "18:00",
        friday: "18:00",
      },
    };

    try {
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      toast.loading("Carregando modo demo...", { id: "demo-mode" });

      const age = 2025 - 1990; // Demo age
      const fitnessGoal = "muscle_gain";

      const { error } = await supabase
        .from('profiles' as any)
        .upsert({
          user_id: user.id,
          name: demoData.name,
          age: age,
          weight: demoData.weight,
          height: demoData.height,
          gender: demoData.gender,
          fitness_goal: fitnessGoal,
          onboarding_completed: true
        } as any, {
          onConflict: 'user_id'
        } as any);

      if (error) {
        console.error('Erro ao salvar perfil demo:', error);
        toast.error("Erro ao ativar modo demo", { id: "demo-mode" });
        return;
      }

      // Garantir que a transação foi completada
      await new Promise(resolve => setTimeout(resolve, 300));

      // Salvar no localStorage como backup
      const completeUserData = {
        name: demoData.name,
        age: age,
        height: demoData.height,
        weight: demoData.weight,
        goalWeight: demoData.goalWeight,
        gender: demoData.gender,
        birthDate: demoData.birthDate,
        weightUnit: demoData.weightUnit,
        heightUnit: demoData.heightUnit,
        experience: demoData.experience,
        gymType: demoData.gymType,
        mainGoal: demoData.mainGoal,
        muscleFocus: demoData.muscleFocus,
        includeCardio: demoData.includeCardio,
        trainingDays: demoData.trainingDays,
        trainingSchedule: demoData.trainingSchedule,
        activityLevel: "moderate",
        fitnessGoal: fitnessGoal,
        hasCompletedOnboarding: true
      };
      
      localStorage.setItem('userData', JSON.stringify(completeUserData));
      localStorage.setItem('onboardingCompleted', 'true');
      
      toast.success("Modo demo ativado! Redirecionando...", { id: "demo-mode" });
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao ativar modo demo:', error);
      toast.error("Erro ao ativar modo demo", { id: "demo-mode" });
    }
  };

  const nextStep = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step - save to Supabase
      const age = data.birthDate ? new Date().getFullYear() - new Date(data.birthDate).getFullYear() : null;
      const fitnessGoal = data.mainGoal === 'hypertrophy' ? 'muscle_gain' : 
                         data.mainGoal === 'weight_loss' ? 'weight_loss' : 'maintenance';
      
      try {
        if (!user) {
          toast.error("Usuário não autenticado");
          return;
        }

        // Salvar no Supabase usando upsert para criar ou atualizar
        const { error } = await supabase
          .from('profiles' as any)
          .upsert({
            user_id: user.id,
            name: data.name,
            age: age,
            weight: data.weight,
            height: data.height,
            gender: data.gender,
            fitness_goal: fitnessGoal,
            onboarding_completed: true
          } as any, {
            onConflict: 'user_id'
          } as any);

        if (error) {
          console.error('Erro ao salvar perfil:', error);
          toast.error("Erro ao salvar dados");
          return;
        }

        // Garantir que a transação foi completada antes de navegar
        await new Promise(resolve => setTimeout(resolve, 300));

        // Também manter no localStorage como backup
        const completeUserData = {
          name: data.name,
          age: age,
          height: data.height,
          weight: data.weight,
          goalWeight: data.goalWeight,
          gender: data.gender,
          birthDate: data.birthDate,
          weightUnit: data.weightUnit,
          heightUnit: data.heightUnit,
          experience: data.experience,
          gymType: data.gymType,
          mainGoal: data.mainGoal,
          muscleFocus: data.muscleFocus,
          includeCardio: data.includeCardio,
          trainingDays: data.trainingDays,
          trainingSchedule: data.trainingSchedule,
          activityLevel: data.experience === 'beginner' ? 'light' : data.experience === 'intermediate' ? 'moderate' : 'high',
          fitnessGoal: fitnessGoal,
          hasCompletedOnboarding: true
        };
        
        localStorage.setItem('userData', JSON.stringify(completeUserData));
        localStorage.setItem('onboardingCompleted', 'true');
        toast.success("Dados salvos com sucesso!");
        navigate('/dashboard');
      } catch (error) {
        console.error('Erro ao finalizar onboarding:', error);
        toast.error("Erro ao salvar dados");
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    const stepProps = {
      data,
      updateData,
      nextStep,
      prevStep,
      fillDemoData,
    };

    switch (currentStep) {
      case 1: return <Step1 {...stepProps} />;
      case 2: return <Step2 {...stepProps} />;
      case 3: return <Step3 {...stepProps} />;
      case 4: return <Step4 {...stepProps} />;
      case 5: return <Step5 {...stepProps} />;
      case 6: return <Step6 {...stepProps} />;
      case 7: return <Step7 {...stepProps} />;
      case 8: return <Step8 {...stepProps} />;
      case 9: return <Step9 {...stepProps} />;
      case 10: return <Step10 {...stepProps} />;
      case 11: return <Step11 {...stepProps} />;
      case 12: return <Step12 {...stepProps} />;
      default: return <Step1 {...stepProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {currentStep > 1 && currentStep < 12 && (
        <ProgressIndicator currentStep={currentStep - 1} totalSteps={totalSteps - 1} />
      )}
      <div className="flex-1 flex items-center justify-center p-4">
        {renderStep()}
      </div>
    </div>
  );
};

export default OnboardingFlow;
