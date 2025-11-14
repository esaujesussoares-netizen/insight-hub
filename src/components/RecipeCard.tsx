import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Clock, Users, Share2, Copy, Check } from 'lucide-react';
import { FavoriteRecipe, RecipeCategory } from '@/hooks/useFavoriteRecipes';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface RecipeCardProps {
  recipe: FavoriteRecipe;
  onDelete: (id: string) => void;
}

export const RecipeCard = ({ recipe, onDelete }: RecipeCardProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const categoryLabels: Record<RecipeCategory, string> = {
    breakfast: 'Café da Manhã',
    lunch: 'Almoço',
    dinner: 'Jantar',
    post_workout: 'Pós-Treino',
    snack: 'Lanche'
  };

  const categoryColors: Record<RecipeCategory, string> = {
    breakfast: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    lunch: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    dinner: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    post_workout: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    snack: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20'
  };

  const tagLabels: Record<string, string> = {
    low_carb: 'Low Carb',
    high_protein: 'High Protein',
    vegetarian: 'Vegetariana',
    vegan: 'Vegana',
    gluten_free: 'Sem Glúten',
    dairy_free: 'Sem Lactose',
    keto: 'Keto',
    paleo: 'Paleo'
  };

  const handleShareWhatsApp = () => {
    const ingredients = recipe.ingredients
      .map(ing => `• ${ing.quantity ? `${ing.quantity} - ${ing.item}` : ing.item}`)
      .join('\n');
    
    const macros = recipe.macros 
      ? `\n*Informações Nutricionais:*\n${recipe.macros.calories ? `🔥 ${recipe.macros.calories} kcal\n` : ''}${recipe.macros.protein ? `💪 ${recipe.macros.protein}g proteína\n` : ''}${recipe.macros.carbs ? `🍞 ${recipe.macros.carbs}g carboidratos\n` : ''}${recipe.macros.fat ? `🥑 ${recipe.macros.fat}g gordura\n` : ''}`
      : '';

    const message = `*${recipe.title}*${recipe.prep_time ? `\n⏱️ ${recipe.prep_time}` : ''}${recipe.servings ? `\n👥 ${recipe.servings} ${recipe.servings === 1 ? 'porção' : 'porções'}` : ''}\n\n*Ingredientes:*\n${ingredients}\n\n*Modo de Preparo:*\n${recipe.instructions}${macros}${recipe.notes ? `\n\n*Notas:*\n${recipe.notes}` : ''}`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleCopyRecipe = async () => {
    const ingredients = recipe.ingredients
      .map(ing => `• ${ing.quantity ? `${ing.quantity} - ${ing.item}` : ing.item}`)
      .join('\n');
    
    const macros = recipe.macros 
      ? `\nInformações Nutricionais:\n${recipe.macros.calories ? `🔥 ${recipe.macros.calories} kcal\n` : ''}${recipe.macros.protein ? `💪 ${recipe.macros.protein}g proteína\n` : ''}${recipe.macros.carbs ? `🍞 ${recipe.macros.carbs}g carboidratos\n` : ''}${recipe.macros.fat ? `🥑 ${recipe.macros.fat}g gordura\n` : ''}`
      : '';

    const text = `${recipe.title}${recipe.prep_time ? `\n⏱️ ${recipe.prep_time}` : ''}${recipe.servings ? `\n👥 ${recipe.servings} ${recipe.servings === 1 ? 'porção' : 'porções'}` : ''}\n\nIngredientes:\n${ingredients}\n\nModo de Preparo:\n${recipe.instructions}${macros}${recipe.notes ? `\n\nNotas:\n${recipe.notes}` : ''}`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Receita copiada!",
        description: "A receita foi copiada para a área de transferência",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a receita",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <CardTitle className="text-xl">{recipe.title}</CardTitle>
              {recipe.category && (
                <Badge variant="outline" className={categoryColors[recipe.category]}>
                  {categoryLabels[recipe.category]}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {recipe.prep_time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {recipe.prep_time}
                </span>
              )}
              {recipe.servings && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {recipe.servings} {recipe.servings === 1 ? 'porção' : 'porções'}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleShareWhatsApp}
              title="Compartilhar no WhatsApp"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleCopyRecipe}
              title="Copiar receita"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover Receita?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja remover "{recipe.title}" dos seus favoritos? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(recipe.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {recipe.prep_time && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {recipe.prep_time}
            </Badge>
          )}
          {recipe.servings && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {recipe.servings} {recipe.servings === 1 ? 'porção' : 'porções'}
            </Badge>
          )}
          {recipe.tags && recipe.tags.length > 0 && recipe.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tagLabels[tag] || tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {recipe.macros && (
          <div className="flex gap-2 flex-wrap">
            {recipe.macros.calories && (
              <Badge variant="outline">{recipe.macros.calories} kcal</Badge>
            )}
            {recipe.macros.protein && (
              <Badge variant="outline">{recipe.macros.protein}g proteína</Badge>
            )}
            {recipe.macros.carbs && (
              <Badge variant="outline">{recipe.macros.carbs}g carbs</Badge>
            )}
            {recipe.macros.fat && (
              <Badge variant="outline">{recipe.macros.fat}g gordura</Badge>
            )}
          </div>
        )}

        <div>
          <h4 className="font-semibold mb-2">Ingredientes:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx}>
                {ing.quantity ? `${ing.quantity} - ${ing.item}` : ing.item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Modo de Preparo:</h4>
          <p className="text-sm whitespace-pre-line">{recipe.instructions}</p>
        </div>

        {recipe.notes && (
          <div>
            <h4 className="font-semibold mb-2">Notas:</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{recipe.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
