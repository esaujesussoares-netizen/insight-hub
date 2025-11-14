import { MuscleGroup } from "@/pages/Exercises";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Exercise {
  name: string;
  equipment: string;
  difficulty: "Iniciante" | "Intermediário" | "Avançado";
  sets: string;
}

const exerciseDatabase: Record<MuscleGroup, Exercise[]> = {
  ombros: [
    { name: "Desenvolvimento com Halteres", equipment: "Halteres", difficulty: "Intermediário", sets: "3x12" },
    { name: "Elevação Lateral", equipment: "Halteres", difficulty: "Iniciante", sets: "3x15" },
    { name: "Desenvolvimento Militar", equipment: "Barra", difficulty: "Avançado", sets: "4x10" },
  ],
  peitoral: [
    { name: "Supino Reto", equipment: "Barra", difficulty: "Intermediário", sets: "4x10" },
    { name: "Crucifixo com Halteres", equipment: "Halteres", difficulty: "Iniciante", sets: "3x12" },
    { name: "Flexão de Braço", equipment: "Peso Corporal", difficulty: "Iniciante", sets: "3x15" },
  ],
  biceps: [
    { name: "Rosca Direta", equipment: "Barra", difficulty: "Iniciante", sets: "3x12" },
    { name: "Rosca Alternada", equipment: "Halteres", difficulty: "Iniciante", sets: "3x10" },
    { name: "Rosca Martelo", equipment: "Halteres", difficulty: "Intermediário", sets: "3x12" },
  ],
  antebracos: [
    { name: "Rosca Punho", equipment: "Halteres", difficulty: "Iniciante", sets: "3x15" },
    { name: "Rosca Inversa", equipment: "Barra", difficulty: "Intermediário", sets: "3x12" },
  ],
  abdomen: [
    { name: "Abdominal Crunch", equipment: "Peso Corporal", difficulty: "Iniciante", sets: "3x20" },
    { name: "Prancha", equipment: "Peso Corporal", difficulty: "Iniciante", sets: "3x30s" },
    { name: "Abdominal Canivete", equipment: "Peso Corporal", difficulty: "Avançado", sets: "3x15" },
  ],
  obliquos: [
    { name: "Prancha Lateral", equipment: "Peso Corporal", difficulty: "Intermediário", sets: "3x30s" },
    { name: "Abdominal Oblíquo", equipment: "Peso Corporal", difficulty: "Iniciante", sets: "3x15" },
  ],
  abdutores: [
    { name: "Abdução de Pernas", equipment: "Máquina", difficulty: "Iniciante", sets: "3x15" },
    { name: "Agachamento Sumô", equipment: "Halteres", difficulty: "Intermediário", sets: "3x12" },
  ],
  adutores: [
    { name: "Adução de Pernas", equipment: "Máquina", difficulty: "Iniciante", sets: "3x15" },
  ],
  quadriceps: [
    { name: "Agachamento Livre", equipment: "Barra", difficulty: "Avançado", sets: "4x10" },
    { name: "Leg Press", equipment: "Máquina", difficulty: "Intermediário", sets: "3x12" },
    { name: "Extensão de Pernas", equipment: "Máquina", difficulty: "Iniciante", sets: "3x15" },
  ],
  cardio: [
    { name: "Corrida", equipment: "Esteira", difficulty: "Iniciante", sets: "20-30min" },
    { name: "Bike", equipment: "Bicicleta", difficulty: "Iniciante", sets: "20-30min" },
    { name: "Burpees", equipment: "Peso Corporal", difficulty: "Avançado", sets: "3x15" },
  ],
  trapezio: [
    { name: "Encolhimento com Halteres", equipment: "Halteres", difficulty: "Iniciante", sets: "3x15" },
    { name: "Remada Alta", equipment: "Barra", difficulty: "Intermediário", sets: "3x12" },
  ],
  triceps: [
    { name: "Tríceps Testa", equipment: "Barra", difficulty: "Intermediário", sets: "3x12" },
    { name: "Tríceps Corda", equipment: "Polia", difficulty: "Iniciante", sets: "3x15" },
    { name: "Mergulho", equipment: "Peso Corporal", difficulty: "Avançado", sets: "3x10" },
  ],
  dorsais: [
    { name: "Barra Fixa", equipment: "Barra", difficulty: "Avançado", sets: "3x8" },
    { name: "Puxada Frontal", equipment: "Polia", difficulty: "Intermediário", sets: "3x12" },
    { name: "Remada Curvada", equipment: "Barra", difficulty: "Intermediário", sets: "4x10" },
  ],
  lombares: [
    { name: "Levantamento Terra", equipment: "Barra", difficulty: "Avançado", sets: "4x8" },
    { name: "Hiperextensão", equipment: "Banco", difficulty: "Intermediário", sets: "3x15" },
  ],
  gluteos: [
    { name: "Agachamento Búlgaro", equipment: "Halteres", difficulty: "Intermediário", sets: "3x12" },
    { name: "Glúteo Quatro Apoios", equipment: "Peso Corporal", difficulty: "Iniciante", sets: "3x15" },
    { name: "Hip Thrust", equipment: "Barra", difficulty: "Intermediário", sets: "3x12" },
  ],
  isquiotibiais: [
    { name: "Mesa Flexora", equipment: "Máquina", difficulty: "Iniciante", sets: "3x12" },
    { name: "Stiff", equipment: "Barra", difficulty: "Intermediário", sets: "3x10" },
    { name: "Levantamento Terra Romeno", equipment: "Barra", difficulty: "Avançado", sets: "4x8" },
  ],
  panturrilhas: [
    { name: "Panturrilha em Pé", equipment: "Máquina", difficulty: "Iniciante", sets: "3x15" },
    { name: "Panturrilha Sentado", equipment: "Máquina", difficulty: "Iniciante", sets: "3x15" },
  ],
};

interface ExerciseListProps {
  muscle: MuscleGroup;
  searchQuery: string;
}

export function ExerciseList({ muscle, searchQuery }: ExerciseListProps) {
  const exercises = exerciseDatabase[muscle] || [];
  
  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty: Exercise["difficulty"]) => {
    switch (difficulty) {
      case "Iniciante":
        return "bg-green-100 text-green-800 border-green-200";
      case "Intermediário":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Avançado":
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-black capitalize">
        {muscle.replace(/([A-Z])/g, ' $1').trim()}
      </h2>
      
      {filteredExercises.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum exercício encontrado.</p>
      ) : (
        <div className="grid gap-3">
          {filteredExercises.map((exercise, index) => (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow border-gray-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-black mb-1">{exercise.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{exercise.equipment}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className={getDifficultyColor(exercise.difficulty)}>
                      {exercise.difficulty}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                      {exercise.sets}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
