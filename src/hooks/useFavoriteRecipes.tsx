import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/untyped';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type RecipeCategory = 'breakfast' | 'lunch' | 'dinner' | 'post_workout' | 'snack';
export type RecipeTag = 'low_carb' | 'high_protein' | 'vegetarian' | 'vegan' | 'gluten_free' | 'dairy_free' | 'keto' | 'paleo';

export interface FavoriteRecipe {
  id: string;
  title: string;
  ingredients: { item: string; quantity: string }[];
  instructions: string;
  macros?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  servings?: number;
  prep_time?: string;
  notes?: string;
  category?: RecipeCategory;
  tags?: string[];
  created_at: string;
}

export const useFavoriteRecipes = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<FavoriteRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRecipes = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorite_recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert Json types to proper TypeScript types
      const typedRecipes = (data || []).map(recipe => ({
        ...recipe,
        ingredients: recipe.ingredients as any as { item: string; quantity: string }[],
        macros: recipe.macros as any as FavoriteRecipe['macros']
      }));
      
      setRecipes(typedRecipes);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      toast.error('Erro ao carregar receitas favoritas');
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecipe = async (recipe: Omit<FavoriteRecipe, 'id' | 'created_at'>) => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para salvar receitas');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorite_recipes')
        .insert({
          user_id: user.id,
          ...recipe
        })
        .select()
        .single();

      if (error) throw error;
      
      const typedRecipe = {
        ...data,
        ingredients: data.ingredients as any as { item: string; quantity: string }[],
        macros: data.macros as any as FavoriteRecipe['macros']
      };
      
      setRecipes(prev => [typedRecipe, ...prev]);
      toast.success('Receita salva com sucesso! 🎉');
      return typedRecipe;
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      toast.error('Erro ao salvar receita');
    }
  };

  const deleteRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from('favorite_recipes')
        .delete()
        .eq('id', recipeId);

      if (error) throw error;
      
      setRecipes(prev => prev.filter(r => r.id !== recipeId));
      toast.success('Receita removida');
    } catch (error) {
      console.error('Erro ao deletar receita:', error);
      toast.error('Erro ao remover receita');
    }
  };

  const updateRecipe = async (recipeId: string, updates: Partial<FavoriteRecipe>) => {
    try {
      const { error } = await supabase
        .from('favorite_recipes')
        .update(updates)
        .eq('id', recipeId);

      if (error) throw error;
      
      setRecipes(prev => prev.map(r => 
        r.id === recipeId ? { ...r, ...updates } : r
      ));
      toast.success('Receita atualizada');
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      toast.error('Erro ao atualizar receita');
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [user?.id]);

  return {
    recipes,
    isLoading,
    saveRecipe,
    deleteRecipe,
    updateRecipe,
    refreshRecipes: loadRecipes
  };
};
