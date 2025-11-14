import React, { useState } from 'react';
import { Search, Play, Info, Dumbbell, ArrowLeft } from 'lucide-react';
import { exerciseDatabase } from '@/database/exercises';
import { useNavigate } from 'react-router-dom';
import AnimatedExercise from '@/components/AnimatedExercise';
import { Layout } from '@/components/Layout';

const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState('peito');
  const [searchTerm, setSearchTerm] = useState('');

  // Grupos musculares
  const muscleGroups = [
    { id: 'peito', name: 'Peitoral', icon: '🦾' },
    { id: 'costas', name: 'Costas', icon: '💪' },
    { id: 'ombros', name: 'Ombros', icon: '👔' },
    { id: 'biceps', name: 'Bíceps', icon: '💪' },
    { id: 'triceps', name: 'Tríceps', icon: '🎯' },
    { id: 'pernas', name: 'Pernas', icon: '🦵' },
    { id: 'gluteos', name: 'Glúteos', icon: '🍑' },
    { id: 'abdomen', name: 'Abdômen', icon: '🎗️' },
    { id: 'cardio', name: 'Cardio', icon: '❤️' }
  ];

  const filteredExercises = exerciseDatabase[selectedGroup]?.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExerciseClick = (exerciseId: number) => {
    navigate(`/exercise/${exerciseId}`);
  };

  const startWorkout = (exerciseId: number) => {
    navigate(`/workout-player/${exerciseId}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Cabeçalho */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/workouts')}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Biblioteca de Exercícios</h1>
              <p className="text-muted-foreground">Selecione um grupo muscular para explorar exercícios</p>
            </div>
          </div>

          {/* Barra de Pesquisa */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar exercícios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              />
            </div>
          </div>

          {/* Grupos Musculares */}
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 mb-8">
            {muscleGroups.map(group => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                  selectedGroup === group.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-2xl mb-1">{group.icon}</span>
                <span className="text-xs font-medium">{group.name}</span>
              </button>
            ))}
          </div>

          {/* Lista de Exercícios */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises?.map(exercise => (
              <div key={exercise.id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg transition-shadow">
                {/* Preview da Animação */}
                <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative">
                  <AnimatedExercise 
                    animation={exercise.animation} 
                    size="medium"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => startWorkout(exercise.id)}
                      className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 shadow-lg transition-colors"
                      title="Iniciar Exercício"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExerciseClick(exercise.id)}
                      className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 shadow-lg transition-colors"
                      title="Ver Detalhes"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Informações do Exercício */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{exercise.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Dumbbell className="w-4 h-4" />
                      {exercise.difficulty}
                    </span>
                    <span>•</span>
                    <span>{exercise.duration}</span>
                  </div>
                  <p className="text-foreground text-sm mb-4 line-clamp-2">{exercise.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      {exercise.sets} séries × {exercise.reps}
                    </div>
                    <button
                      onClick={() => handleExerciseClick(exercise.id)}
                      className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                    >
                      Ver Detalhes →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredExercises?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum exercício encontrado</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExerciseLibrary;
