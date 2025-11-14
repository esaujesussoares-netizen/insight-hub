import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Clock, Utensils, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/untyped";
import { useToast } from "@/hooks/use-toast";
import { useFavoriteRecipes, RecipeCategory } from "@/hooks/useFavoriteRecipes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Recipe {
  title: string;
  description: string;
  prepTime: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
  category: string;
}

interface SuggestedRecipesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SuggestedRecipesDialog = ({ open, onOpenChange }: SuggestedRecipesDialogProps) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory>('lunch');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { toast } = useToast();
  const { saveRecipe } = useFavoriteRecipes();

  const categoryLabels: Record<RecipeCategory, string> = {
    breakfast: 'Café da Manhã',
    lunch: 'Almoço',
    dinner: 'Jantar',
    post_workout: 'Pós-Treino',
    snack: 'Lanche'
  };

  const availableTags = [
    { value: 'low_carb', label: 'Low Carb' },
    { value: 'high_protein', label: 'High Protein' },
    { value: 'vegetarian', label: 'Vegetariana' },
    { value: 'vegan', label: 'Vegana' },
    { value: 'gluten_free', label: 'Sem Glúten' },
    { value: 'dairy_free', label: 'Sem Lactose' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' }
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const generateRecipes = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado",
          variant: "destructive",
        });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('fitness_goal, daily_calories_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase.functions.invoke('suggest-recipes', {
        body: {
          fitnessGoal: profile?.fitness_goal || 'maintenance',
          dailyCalories: profile?.daily_calories_goal || 2000,
          dailyProtein: profile?.daily_protein_goal || 150,
          dailyCarbs: profile?.daily_carbs_goal || 250,
          dailyFat: profile?.daily_fat_goal || 65,
        },
      });

      if (error) throw error;

      if (data?.recipes) {
        setRecipes(data.recipes);
        toast({
          title: "✨ Receitas geradas!",
          description: `${data.recipes.length} receitas personalizadas para você`,
        });
      }
    } catch (error: any) {
      console.error('Erro ao gerar receitas:', error);
      toast({
        title: "Erro ao gerar receitas",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    setIsSaving(true);
    try {
      const ingredientsList = recipe.ingredients.map(ing => ({
        item: ing,
        quantity: ''
      }));

      await saveRecipe({
        title: recipe.title,
        ingredients: ingredientsList,
        instructions: recipe.instructions.join('\n'),
        macros: {
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat
        },
        servings: recipe.servings,
        prep_time: recipe.prepTime,
        notes: recipe.description,
        category: selectedCategory,
        tags: selectedTags
      });
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Receitas Sugeridas Personalizadas</DialogTitle>
            <DialogDescription>
              Receitas aleatórias baseadas no seu objetivo fitness
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={generateRecipes}
                disabled={isLoading}
                className="flex-1"
                variant="nutrition"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando receitas...
                  </>
                ) : (
                  <>
                    <Utensils className="w-4 h-4" />
                    Gerar Receitas Personalizadas
                  </>
                )}
              </Button>
              {recipes.length > 0 && (
                <Button
                  onClick={generateRecipes}
                  disabled={isLoading}
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>

            {recipes.length === 0 && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Clique em "Gerar Receitas" para ver sugestões personalizadas</p>
              </div>
            )}

            {recipes.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {recipes.map((recipe, index) => (
                  <Card key={index} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{recipe.title}</h3>
                        <Badge variant="secondary" className="mb-2">
                          {recipe.category}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{recipe.description}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {recipe.prepTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Utensils className="w-4 h-4" />
                        {recipe.servings} porções
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-2 border-t">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Calorias</div>
                        <div className="font-semibold flex items-center justify-center gap-1">
                          <Flame className="w-3 h-3" />
                          {recipe.calories}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Proteína</div>
                        <div className="font-semibold">{recipe.protein}g</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Carbs</div>
                        <div className="font-semibold">{recipe.carbs}g</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Gordura</div>
                        <div className="font-semibold">{recipe.fat}g</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <details className="text-sm">
                        <summary className="cursor-pointer font-medium text-primary">
                          Ingredientes
                        </summary>
                        <ul className="mt-2 space-y-1 ml-4 list-disc text-muted-foreground">
                          {recipe.ingredients.map((ingredient, i) => (
                            <li key={i}>{ingredient}</li>
                          ))}
                        </ul>
                      </details>

                      <details className="text-sm">
                        <summary className="cursor-pointer font-medium text-primary">
                          Modo de Preparo
                        </summary>
                        <ol className="mt-2 space-y-1 ml-4 list-decimal text-muted-foreground">
                          {recipe.instructions.map((instruction, i) => (
                            <li key={i}>{instruction}</li>
                          ))}
                        </ol>
                      </details>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`category-${index}`}>Categoria da Receita</Label>
                      <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as RecipeCategory)}>
                        <SelectTrigger id={`category-${index}`}>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(categoryLabels) as RecipeCategory[]).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {categoryLabels[cat]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tags Nutricionais</Label>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => (
                          <Badge
                            key={tag.value}
                            variant={selectedTags.includes(tag.value) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleTag(tag.value)}
                          >
                            {tag.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSaveRecipe(recipe)}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        'Salvar Receita'
                      )}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
