import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Timer, Flame, Trophy, RotateCw, Upload } from "lucide-react";
import { Layout } from "@/components/Layout";
import { WorkoutCard } from "@/components/WorkoutCard";
import { WorkoutMuscleMap } from "@/components/WorkoutMuscleMap";
import { supabase } from "@/integrations/supabase/untyped";
import { toast } from "sonner";
import { exerciseDatabase } from "@/database/exercises";
import { InteractiveMuscleGroup } from "@/components/InteractiveMuscleGroup";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MuscleGroupCard } from "@/components/MuscleGroupCard";
import { MuscleGroupDetailModal } from "@/components/MuscleGroupDetailModal";
import { BulkGifUploader } from "@/components/BulkGifUploader";
import { WorkoutRecommendations } from "@/components/WorkoutRecommendations";

// Import muscle group icons
import chestIcon from "@/assets/muscle-icons/chest-icon.png";
import backIcon from "@/assets/muscle-icons/back-icon.png";
import shouldersIcon from "@/assets/muscle-icons/shoulders-icon.png";
import bicepsIcon from "@/assets/muscle-icons/biceps-icon.png";
import tricepsIcon from "@/assets/muscle-icons/triceps-icon.png";
import forearmIcon from "@/assets/muscle-icons/forearm-icon.png";
import legsIcon from "@/assets/muscle-icons/legs-icon.png";
import glutesIcon from "@/assets/muscle-icons/glutes-icon.png";
import absIcon from "@/assets/muscle-icons/abs-icon.png";
import cardioIcon from "@/assets/muscle-icons/cardio-icon.png";

interface Workout {
  id: string;
  name: string;
  description: string;
  category: string;
  duration_minutes: number;
  estimated_calories: number;
  difficulty: string;
  exercises_data: any[];
}

const categories = [
  { name: "Todos", key: "all" },
  { name: "7 Minutos", key: "7_minute" },
  { name: "Full Body", key: "full_body" },
  { name: "Abdômen", key: "abs" },
  { name: "HIIT", key: "hiit" },
  { name: "Força", key: "strength" },
  { name: "Pernas", key: "legs" },
  { name: "Costas", key: "back" },
  { name: "Cardio", key: "cardio" },
];

export default function Workouts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [view, setView] = useState<"front" | "back">("front");
  
  // Estados para a Biblioteca de Exercícios
  const [selectedGroup, setSelectedGroup] = useState('peito');
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');
  const [exerciseCounts, setExerciseCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadWorkouts();
    loadWorkoutHistory();
    loadExerciseCounts();
  }, []);

  const loadWorkouts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .order("category", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar treinos");
    } else {
      setWorkouts(data as Workout[]);
    }
    setLoading(false);
  };

  const loadWorkoutHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data } = await supabase
        .from("workout_history")
        .select("*, workouts(*)")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(5);

      if (data) {
        setWorkoutHistory(data);
      }
    }
  };

  const loadExerciseCounts = async () => {
    const { data, error } = await supabase
      .from("exercise_library")
      .select("muscle_group");

    if (error) {
      console.error("Erro ao carregar contagem de exercícios:", error);
      return;
    }

    // Mapear IDs dos grupos com os nomes da tabela
    const groupMapping: Record<string, string[]> = {
      'peito': ['peito', 'peitoral', 'chest'],
      'costas': ['costas', 'back'],
      'ombros': ['ombros', 'ombro', 'shoulders'],
      'biceps': ['biceps', 'bíceps'],
      'triceps': ['triceps', 'tríceps'],
      'antebraco': ['antebraco', 'antebraço', 'forearm'],
      'pernas': ['pernas', 'perna', 'legs', 'quadriceps', 'posterior'],
      'gluteos': ['gluteos', 'glúteos', 'glutes'],
      'abdomen': ['abdomen', 'abdômen', 'abs'],
      'cardio': ['cardio']
    };

    const counts: Record<string, number> = {};
    
    // Contar exercícios para cada grupo
    Object.entries(groupMapping).forEach(([groupId, keywords]) => {
      counts[groupId] = data.filter(ex => 
        keywords.some(keyword => 
          ex.muscle_group?.toLowerCase().includes(keyword.toLowerCase())
        )
      ).length;
    });

    setExerciseCounts(counts);
  };

  const handleMuscleSelect = (muscle: string) => {
    setSelectedMuscle(muscle === selectedMuscle ? null : muscle);
  };

  const handleRotate = () => {
    setView(view === "front" ? "back" : "front");
    setSelectedMuscle(null);
  };

  const filteredWorkouts = workouts.filter((workout) => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || workout.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Estados para modal de detalhes
  const [selectedGroupDetail, setSelectedGroupDetail] = useState<any>(null);

  // Grupos musculares para a biblioteca - ESTRUTURA COMPLETA
  const muscleGroups = [
    { 
      id: 'peito', 
      name: 'Peitoral', 
      icon: chestIcon,
      color: '#FF6B6B',
      subGroups: ['Peitoral Superior', 'Peitoral Médio', 'Peitoral Inferior'],
      description: 'Exercícios para desenvolvimento, definição e alongamento do peitoral'
    },
    { 
      id: 'costas', 
      name: 'Costas', 
      icon: backIcon,
      color: '#4ECDC4',
      subGroups: ['Dorsais', 'Trapézio', 'Lombares'],
      description: 'Exercícios para desenvolvimento de espessura e largura das costas'
    },
    { 
      id: 'ombros', 
      name: 'Ombros', 
      icon: shouldersIcon,
      color: '#45B7D1',
      subGroups: ['Deltoide Anterior', 'Deltoide Lateral', 'Deltoide Posterior'],
      description: 'Exercícios para desenvolvimento de força e volume dos ombros'
    },
    { 
      id: 'biceps', 
      name: 'Bíceps', 
      icon: bicepsIcon,
      color: '#96CEB4',
      subGroups: ['Bíceps Braquial', 'Braquial'],
      description: 'Exercícios para desenvolvimento dos bíceps'
    },
    { 
      id: 'triceps', 
      name: 'Tríceps', 
      icon: tricepsIcon,
      color: '#FFEAA7',
      subGroups: ['Cabeça Longa', 'Cabeça Lateral', 'Cabeça Medial'],
      description: 'Exercícios eficazes para fortalecimento dos tríceps'
    },
    { 
      id: 'antebraco', 
      name: 'Antebraço', 
      icon: forearmIcon,
      color: '#DDA0DD',
      subGroups: ['Flexores', 'Extensores', 'Pronadores', 'Supinadores'],
      description: 'Exercícios para fortalecimento e desenvolvimento dos antebraços'
    },
    { 
      id: 'pernas', 
      name: 'Pernas', 
      icon: legsIcon,
      color: '#98D8C8',
      subGroups: ['Quadríceps', 'Isquiotibiais', 'Panturrilhas'],
      description: 'Exercícios completos para fortalecimento dos membros inferiores'
    },
    { 
      id: 'gluteos', 
      name: 'Glúteos', 
      icon: glutesIcon,
      color: '#F7DC6F',
      subGroups: ['Glúteo Máximo', 'Glúteo Médio', 'Glúteo Mínimo'],
      description: 'Exercícios para tonificação e fortalecimento dos glúteos'
    },
    { 
      id: 'abdomen', 
      name: 'Abdômen', 
      icon: absIcon,
      color: '#BB8FCE',
      subGroups: ['Superior', 'Inferior', 'Oblíquos', 'Transverso'],
      description: 'Exercícios para fortalecimento do core e definição abdominal'
    },
    { 
      id: 'cardio', 
      name: 'Cardio', 
      icon: cardioIcon,
      color: '#85C1E9',
      subGroups: ['Aeróbico', 'Anaeróbico', 'HIIT'],
      description: 'Exercícios cardiovasculares de alta intensidade'
    }
  ];

  const filteredExercises = exerciseDatabase[selectedGroup]?.filter(exercise =>
    exercise.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="w-full mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Treinos & Exercícios
          </h1>
          <p className="text-muted-foreground">
            Explore treinos rápidos e nossa biblioteca completa de exercícios
          </p>
        </div>

        <Tabs defaultValue="workouts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="workouts">Treinos Rápidos</TabsTrigger>
            <TabsTrigger value="exercises">Biblioteca de Exercícios</TabsTrigger>
          </TabsList>

          {/* ABA DE TREINOS RÁPIDOS */}
          <TabsContent value="workouts" className="space-y-6">

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Buscar treinos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide -mx-4 px-4">
          {categories.map((category) => (
            <Button
              key={category.key}
              variant={activeCategory === category.key ? "default" : "outline"}
              onClick={() => setActiveCategory(category.key)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* AI Workout Recommendations */}
        <WorkoutRecommendations />

        {/* Muscle Map Selector */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Selecione o Grupo Muscular</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
                className="gap-2"
              >
                <RotateCw className="w-4 h-4" />
                Girar
              </Button>
            </div>
            <CardDescription>
              Clique em um grupo muscular para filtrar treinos específicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkoutMuscleMap
              view={view}
              selectedMuscle={selectedMuscle}
              onMuscleSelect={handleMuscleSelect}
            />
            {selectedMuscle && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setSelectedMuscle(null)}
                >
                  Limpar Seleção
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workout History */}
        {workoutHistory.length > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Histórico Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workoutHistory.map((history) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between p-3 bg-card rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{history.workouts?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(history.completed_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{history.calories_burned} kcal</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.floor(history.duration_seconds / 60)} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Workouts Highlight */}
        {activeCategory === "all" && (
          <Card className="mb-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-6 h-6 text-primary" />
                Treino de 7 Minutos
              </CardTitle>
              <CardDescription>
                Circuito rápido e eficiente para o corpo inteiro - Ideal para começar o dia!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  <span>7 minutos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>~80 kcal</span>
                </div>
                <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                  Iniciante
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workouts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-muted-foreground">Carregando treinos...</div>
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum treino encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-24 w-full">
            {filteredWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                id={workout.id}
                name={workout.name}
                description={workout.description}
                category={workout.category}
                duration_minutes={workout.duration_minutes}
                estimated_calories={workout.estimated_calories}
                difficulty={workout.difficulty}
                exercises_count={workout.exercises_data.length}
              />
            ))}
          </div>
        )}
          </TabsContent>

          {/* ABA DE BIBLIOTECA DE EXERCÍCIOS */}
          <TabsContent value="exercises" className="space-y-6">
            {/* Barra de Pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Pesquisar exercícios..."
                value={exerciseSearchTerm}
                onChange={(e) => setExerciseSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Header com Upload em Lote */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold">Grupos Musculares</h3>
                <p className="text-sm text-muted-foreground">Clique em um grupo para ver detalhes e exercícios</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload em Lote
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Upload em Lote de GIFs - {muscleGroups.find(g => g.id === selectedGroup)?.name || 'Todos'}</DialogTitle>
                  </DialogHeader>
                  <BulkGifUploader selectedMuscleGroup={selectedGroup} />
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Grid de Grupos Musculares - NOVO DESIGN */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
              {muscleGroups.map(group => (
                <MuscleGroupCard
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  icon={group.icon}
                  color={group.color}
                  isSelected={selectedGroup === group.id}
                  exerciseCount={exerciseCounts[group.id] || 0}
                  onClick={() => {
                    setSelectedGroup(group.id);
                    setSelectedGroupDetail(group);
                  }}
                />
              ))}
            </div>

            {/* Mapeamento Muscular Interativo */}
            <InteractiveMuscleGroup
              groupName={muscleGroups.find(g => g.id === selectedGroup)?.name || 'Peitoral'}
              groupIcon={muscleGroups.find(g => g.id === selectedGroup)?.icon || chestIcon}
              groupDescription={muscleGroups.find(g => g.id === selectedGroup)?.description || ''}
              subdivisions={muscleGroups.find(g => g.id === selectedGroup)?.subGroups || []}
              exercises={filteredExercises || []}
            />

            {filteredExercises?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum exercício encontrado</p>
              </div>
            )}

            {/* Modal de Detalhes do Grupo Muscular */}
            <MuscleGroupDetailModal
              group={selectedGroupDetail}
              onClose={() => setSelectedGroupDetail(null)}
              exercises={filteredExercises || []}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
