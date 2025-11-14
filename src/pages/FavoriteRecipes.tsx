import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useFavoriteRecipes, RecipeCategory } from '@/hooks/useFavoriteRecipes';
import { RecipeCard } from '@/components/RecipeCard';
import { Loader2, ChefHat, Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function FavoriteRecipes() {
  const { recipes, isLoading, deleteRecipe } = useFavoriteRecipes();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');

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

  const filteredRecipes = recipes
    .filter(recipe => {
      // Filter by category
      if (selectedCategory !== 'all' && recipe.category !== selectedCategory) {
        return false;
      }
      
      // Filter by tag
      if (selectedTagFilter !== 'all' && !recipe.tags?.includes(selectedTagFilter)) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = recipe.title.toLowerCase().includes(query);
        const matchesIngredients = recipe.ingredients.some(ing => 
          ing.item.toLowerCase().includes(query)
        );
        return matchesTitle || matchesIngredients;
      }

      return true;
    });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ChefHat className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Receitas Favoritas</h1>
          </div>
          <p className="text-muted-foreground">
            Suas receitas personalizadas criadas pelo NutriAI
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20">
            <ChefHat className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma receita salva ainda</h3>
            <p className="text-muted-foreground mb-6">
              Converse com o NutriAI e salve suas receitas favoritas!
            </p>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou ingredientes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
              <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
                <TabsTrigger value="all">Todas ({recipes.length})</TabsTrigger>
                <TabsTrigger value="breakfast">
                  Café da Manhã ({recipes.filter(r => r.category === 'breakfast').length})
                </TabsTrigger>
                <TabsTrigger value="lunch">
                  Almoço ({recipes.filter(r => r.category === 'lunch').length})
                </TabsTrigger>
                <TabsTrigger value="dinner">
                  Jantar ({recipes.filter(r => r.category === 'dinner').length})
                </TabsTrigger>
                <TabsTrigger value="post_workout">
                  Pós-Treino ({recipes.filter(r => r.category === 'post_workout').length})
                </TabsTrigger>
                <TabsTrigger value="snack">
                  Lanche ({recipes.filter(r => r.category === 'snack').length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Tag Filters */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Filtrar por tags nutricionais:</p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedTagFilter === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedTagFilter('all')}
                >
                  Todas
                </Badge>
                {availableTags.map(tag => (
                  <Badge
                    key={tag.value}
                    variant={selectedTagFilter === tag.value ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedTagFilter(tag.value)}
                  >
                    {tag.label}
                  </Badge>
                ))}
              </div>
            </div>

            {filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhuma receita encontrada nesta categoria.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onDelete={deleteRecipe}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
