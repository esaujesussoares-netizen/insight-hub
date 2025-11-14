import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/untyped";

interface NutritionGoalsDialogProps {
  currentGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onGoalsUpdated: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NutritionGoalsDialog({ currentGoals, onGoalsUpdated, open: externalOpen, onOpenChange: externalOnOpenChange }: NutritionGoalsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const [calories, setCalories] = useState(currentGoals.calories);
  const [protein, setProtein] = useState(currentGoals.protein);
  const [carbs, setCarbs] = useState(currentGoals.carbs);
  const [fat, setFat] = useState(currentGoals.fat);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCalories(currentGoals.calories);
    setProtein(currentGoals.protein);
    setCarbs(currentGoals.carbs);
    setFat(currentGoals.fat);
  }, [currentGoals]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para salvar suas metas.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          daily_calories_goal: calories,
          daily_protein_goal: protein,
          daily_carbs_goal: carbs,
          daily_fat_goal: fat,
        })
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      toast({
        title: "Metas Atualizadas! ✅",
        description: "Suas metas nutricionais foram salvas com sucesso.",
      });

      setOpen(false);
      onGoalsUpdated();
    } catch (error) {
      console.error("Erro ao salvar metas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas metas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Metas Nutricionais</DialogTitle>
          <DialogDescription>
            Ajuste suas metas diárias de acordo com seus objetivos
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="calories">Calorias (kcal)</Label>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              min="0"
              step="50"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="protein">Proteínas (g)</Label>
            <Input
              id="protein"
              type="number"
              value={protein}
              onChange={(e) => setProtein(Number(e.target.value))}
              min="0"
              step="5"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="carbs">Carboidratos (g)</Label>
            <Input
              id="carbs"
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(Number(e.target.value))}
              min="0"
              step="5"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fat">Gorduras (g)</Label>
            <Input
              id="fat"
              type="number"
              value={fat}
              onChange={(e) => setFat(Number(e.target.value))}
              min="0"
              step="5"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button variant="nutrition" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar Metas"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
