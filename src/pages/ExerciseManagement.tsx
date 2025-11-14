import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Filter, Database, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/untyped';
import { toast } from 'sonner';
import ExerciseManagementCard from '@/components/ExerciseManagementCard';
import { Skeleton } from '@/components/ui/skeleton';
import { BulkGifUploader } from '@/components/BulkGifUploader';

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  difficulty: string | null;
  description: string | null;
  gif_url: string | null;
  equipment: any;
  sets: number | null;
  reps: string | null;
  rest_time: number | null;
  duration: string | null;
  instructions: any;
  tips: any;
}

const ExerciseManagement: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  const muscleGroups = [
    { value: 'all', label: 'Todos os Grupos' },
    { value: 'peito', label: 'Peito' },
    { value: 'costas', label: 'Costas' },
    { value: 'pernas', label: 'Pernas' },
    { value: 'ombros', label: 'Ombros' },
    { value: 'bracos', label: 'Braços' },
    { value: 'abdomen', label: 'Abdômen' },
    { value: 'gluteos', label: 'Glúteos' },
    { value: 'antebracos', label: 'Antebraços' },
    { value: 'cardio', label: 'Cardio' },
  ];

  const difficulties = [
    { value: 'all', label: 'Todas as Dificuldades' },
    { value: 'iniciante', label: 'Iniciante' },
    { value: 'intermediário', label: 'Intermediário' },
    { value: 'avançado', label: 'Avançado' },
  ];

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercise_library')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setExercises(data || []);
    } catch (error) {
      console.error('Erro ao buscar exercícios:', error);
      toast.error('Erro ao carregar exercícios');
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseUpdate = () => {
    fetchExercises();
  };

  const handleExerciseDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exercise_library')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Exercício deletado com sucesso');
      fetchExercises();
    } catch (error) {
      console.error('Erro ao deletar exercício:', error);
      toast.error('Erro ao deletar exercício');
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscleGroup = selectedMuscleGroup === 'all' || exercise.muscle_group === selectedMuscleGroup;
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesMuscleGroup && matchesDifficulty;
  });

  const exercisesWithGif = filteredExercises.filter(ex => ex.gif_url).length;
  const exercisesWithoutGif = filteredExercises.filter(ex => !ex.gif_url).length;

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Gerenciamento de Exercícios</h1>
                <p className="text-muted-foreground">
                  Gerencie, edite e atualize a biblioteca de exercícios
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setBulkUploadOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload em Lote
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Total de Exercícios</div>
            <div className="text-3xl font-bold text-primary">{filteredExercises.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Com GIF</div>
            <div className="text-3xl font-bold text-green-500">{exercisesWithGif}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Sem GIF</div>
            <div className="text-3xl font-bold text-orange-500">{exercisesWithoutGif}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Filtros</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Muscle Group Filter */}
            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Grupo Muscular" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map((group) => (
                  <SelectItem key={group.value} value={group.value}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulty Filter */}
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((diff) => (
                  <SelectItem key={diff.value} value={diff.value}>
                    {diff.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedMuscleGroup !== 'all' || selectedDifficulty !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedMuscleGroup('all');
                setSelectedDifficulty('all');
              }}
              className="mt-4"
            >
              Limpar Filtros
            </Button>
          )}
        </Card>

        {/* Exercise List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="w-full h-48 mb-4" />
                <Skeleton className="w-3/4 h-6 mb-2" />
                <Skeleton className="w-full h-4" />
              </Card>
            ))}
          </div>
        ) : filteredExercises.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground mb-4">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhum exercício encontrado</p>
              <p className="text-sm">Tente ajustar os filtros de busca</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <ExerciseManagementCard
                key={exercise.id}
                exercise={exercise}
                onUpdate={handleExerciseUpdate}
                onDelete={handleExerciseDelete}
              />
            ))}
          </div>
        )}

        {/* Bulk Upload Dialog - Nova Versão Melhorada */}
        <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload em Lote de GIFs - Nova Versão</DialogTitle>
              <DialogDescription>
                Sistema melhorado com filtro por grupo muscular e correspondência automática inteligente
              </DialogDescription>
            </DialogHeader>
            <BulkGifUploader 
              selectedMuscleGroup={selectedMuscleGroup === 'all' ? undefined : selectedMuscleGroup}
              onComplete={() => {
                fetchExercises();
                setBulkUploadOpen(false);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ExerciseManagement;
