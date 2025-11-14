import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFavoriteRecipes } from '@/hooks/useFavoriteRecipes';
import { Loader2 } from 'lucide-react';

interface SaveRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipeContent: string;
}

export const SaveRecipeDialog = ({ open, onOpenChange, recipeContent }: SaveRecipeDialogProps) => {
  const { saveRecipe } = useFavoriteRecipes();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servings: '1',
    prep_time: '',
    notes: ''
  });

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.ingredients.trim() || !formData.instructions.trim()) {
      return;
    }

    setIsSaving(true);
    
    // Parse ingredients
    const ingredientsList = formData.ingredients
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const parts = line.trim().split(/[-:]/);
        return {
          item: parts[0]?.trim() || line.trim(),
          quantity: parts[1]?.trim() || ''
        };
      });

    // Parse macros
    const macros = {
      calories: formData.calories ? parseFloat(formData.calories) : undefined,
      protein: formData.protein ? parseFloat(formData.protein) : undefined,
      carbs: formData.carbs ? parseFloat(formData.carbs) : undefined,
      fat: formData.fat ? parseFloat(formData.fat) : undefined
    };

    await saveRecipe({
      title: formData.title,
      ingredients: ingredientsList,
      instructions: formData.instructions,
      macros: Object.keys(macros).length > 0 ? macros : undefined,
      servings: parseInt(formData.servings) || 1,
      prep_time: formData.prep_time || undefined,
      notes: formData.notes || undefined
    });

    setIsSaving(false);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      title: '',
      ingredients: '',
      instructions: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      servings: '1',
      prep_time: '',
      notes: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Salvar Receita</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da receita para salvá-la em seus favoritos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="title">Título da Receita *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Frango Grelhado com Legumes"
            />
          </div>

          <div>
            <Label htmlFor="ingredients">Ingredientes * (um por linha)</Label>
            <Textarea
              id="ingredients"
              value={formData.ingredients}
              onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
              placeholder="200g de peito de frango&#10;1 xícara de brócolis&#10;2 colheres de azeite"
              rows={6}
            />
          </div>

          <div>
            <Label htmlFor="instructions">Modo de Preparo *</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="1. Tempere o frango...&#10;2. Grelhe por 5 minutos...&#10;3. Sirva com os legumes..."
              rows={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="servings">Porções</Label>
              <Input
                id="servings"
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData(prev => ({ ...prev, servings: e.target.value }))}
                placeholder="1"
              />
            </div>

            <div>
              <Label htmlFor="prep_time">Tempo de Preparo</Label>
              <Input
                id="prep_time"
                value={formData.prep_time}
                onChange={(e) => setFormData(prev => ({ ...prev, prep_time: e.target.value }))}
                placeholder="30 minutos"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label htmlFor="calories">Calorias</Label>
              <Input
                id="calories"
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData(prev => ({ ...prev, calories: e.target.value }))}
                placeholder="350"
              />
            </div>
            <div>
              <Label htmlFor="protein">Proteína (g)</Label>
              <Input
                id="protein"
                type="number"
                value={formData.protein}
                onChange={(e) => setFormData(prev => ({ ...prev, protein: e.target.value }))}
                placeholder="45"
              />
            </div>
            <div>
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                value={formData.carbs}
                onChange={(e) => setFormData(prev => ({ ...prev, carbs: e.target.value }))}
                placeholder="20"
              />
            </div>
            <div>
              <Label htmlFor="fat">Gordura (g)</Label>
              <Input
                id="fat"
                type="number"
                value={formData.fat}
                onChange={(e) => setFormData(prev => ({ ...prev, fat: e.target.value }))}
                placeholder="12"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notas Adicionais</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Dicas, substituições ou observações..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={isSaving || !formData.title.trim() || !formData.ingredients.trim() || !formData.instructions.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Receita'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
