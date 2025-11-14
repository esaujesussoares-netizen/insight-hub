import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Flame, Play, Pencil, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/untyped";
import { toast } from "sonner";
import workoutArmsAbs from "@/assets/workout-arms-abs.jpg";
import workoutChestLegs from "@/assets/workout-chest-legs.jpg";
import workoutAbsDefined from "@/assets/workout-abs-defined.jpg";
import workoutLegsGlutes from "@/assets/workout-legs-glutes.jpg";
import workoutFreeweights from "@/assets/workout-freeweights.jpg";
import workoutBack from "@/assets/workout-back.jpg";
import workoutLegsFemale from "@/assets/workout-legs-female.jpg";
import workoutCardio from "@/assets/workout-cardio.jpg";

interface WorkoutCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  duration_minutes: number;
  estimated_calories: number;
  difficulty: string;
  exercises_count: number;
}

export function WorkoutCard({
  id,
  name,
  description,
  category,
  duration_minutes,
  estimated_calories,
  difficulty,
  exercises_count,
}: WorkoutCardProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [isSaving, setIsSaving] = useState(false);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "advanced":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-muted";
    }
  };

  const getCategoryName = (cat: string) => {
    const names: Record<string, string> = {
      "7_minute": "7 Minutos",
      full_body: "Full Body",
      abs: "Abdômen",
      hiit: "HIIT",
      strength: "Força",
      legs: "Pernas",
      back: "Costas",
      cardio: "Cardio",
    };
    return names[cat] || cat;
  };

  const getDifficultyLabel = (level: string) => {
    const labels: Record<string, string> = {
      beginner: "Iniciante",
      intermediate: "Intermediário",
      advanced: "Avançado",
    };
    return labels[level] || level;
  };

  const getCategoryImage = (cat: string) => {
    const images: Record<string, string> = {
      "7_minute": workoutCardio,
      full_body: workoutFreeweights,
      abs: workoutAbsDefined,
      hiit: workoutCardio,
      strength: workoutFreeweights,
      legs: workoutLegsGlutes,
      back: workoutBack,
      cardio: workoutCardio,
      chest: workoutChestLegs,
      arms: workoutArmsAbs,
    };
    return images[cat] || workoutFreeweights;
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error("O nome não pode estar vazio");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from("workouts")
      .update({ name: editedName })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar nome do treino");
      setEditedName(name);
    } else {
      toast.success("Nome atualizado com sucesso!");
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setEditedName(name);
    setIsEditing(false);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] bg-gradient-to-br from-card to-card/50">
      <div className="relative h-48 md:h-56">
        {/* Imagem de fundo */}
        <div className="absolute inset-0">
          <img 
            src={getCategoryImage(category)} 
            alt={name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Conteúdo sobre a imagem */}
        <div className="relative h-full p-6 flex flex-col justify-between">
          <div>
            <Badge variant="outline" className="mb-2 bg-background/80 backdrop-blur-sm">
              {getCategoryName(category)}
            </Badge>
            
            {/* Nome do Treino - Editável */}
            <div className="flex items-center gap-2 mb-2">
              {isEditing ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="h-8 bg-background/90 text-foreground border-primary/50"
                    autoFocus
                    disabled={isSaving}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveName}
                    disabled={isSaving}
                    className="h-8 w-8 p-0 bg-green-500/80 hover:bg-green-500 text-white"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="h-8 w-8 p-0 bg-red-500/80 hover:bg-red-500 text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-white">{name}</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="h-7 w-7 p-0 bg-background/60 hover:bg-background/80 text-foreground"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-sm text-white/90">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{duration_minutes} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>~{estimated_calories} kcal</span>
              </div>
              <Badge className={getDifficultyColor(difficulty)} variant="secondary">
                {getDifficultyLabel(difficulty)}
              </Badge>
            </div>
          </div>

          <Button
            onClick={() => navigate(`/workout-player/${id}`)}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Iniciar Treino
          </Button>
        </div>
      </div>
    </Card>
  );
}
