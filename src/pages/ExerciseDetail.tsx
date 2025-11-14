import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Clock, Award, Info, ArrowLeft, Dumbbell } from 'lucide-react';
import { getExerciseById } from '@/database/exercises';
import AnimatedExercise from '@/components/AnimatedExercise';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const exercise = getExerciseById(parseInt(id || '0'));

  if (!exercise) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Exercício não encontrado</h2>
            <Button onClick={() => navigate('/exercise-library')}>
              Voltar para Biblioteca
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const startExercise = () => {
    navigate(`/workout-player/${exercise.id}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl shadow-sm overflow-hidden border border-border">
            {/* Cabeçalho com Animação */}
            <div className="bg-gradient-to-r from-primary to-secondary p-8 text-primary-foreground">
              <button
                onClick={() => navigate('/exercise-library')}
                className="mb-4 flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </button>
              
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{exercise.name}</h1>
                  <div className="flex flex-wrap gap-4 text-sm mb-4 opacity-90">
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {exercise.difficulty}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {exercise.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell className="w-4 h-4" />
                      {exercise.muscleGroup}
                    </span>
                  </div>
                  <p className="opacity-90">{exercise.description}</p>
                </div>
                <div className="relative bg-white/10 rounded-xl p-6">
                  <AnimatedExercise animation={exercise.animation} size="large" />
                </div>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="p-6">
              {/* Abas de Navegação */}
              <Tabs defaultValue="instructions" className="w-full">
                <TabsList className="w-full justify-start mb-6">
                  <TabsTrigger value="instructions">Instruções</TabsTrigger>
                  <TabsTrigger value="tips">Dicas</TabsTrigger>
                  <TabsTrigger value="equipment">Equipamento</TabsTrigger>
                </TabsList>

                {/* Conteúdo das Abas */}
                <TabsContent value="instructions" className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Como Executar</h3>
                  {exercise.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-foreground">{instruction}</p>
                    </div>
                  ))}
                  
                  <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{exercise.sets}</div>
                      <div className="text-sm text-muted-foreground">Séries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{exercise.reps}</div>
                      <div className="text-sm text-muted-foreground">Repetições</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{exercise.restTime}s</div>
                      <div className="text-sm text-muted-foreground">Descanso</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tips" className="space-y-3">
                  <h3 className="text-xl font-semibold mb-4">Dicas Importantes</h3>
                  {exercise.tips && exercise.tips.length > 0 ? (
                    exercise.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-foreground">{tip}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Nenhuma dica disponível para este exercício.</p>
                  )}
                </TabsContent>

                <TabsContent value="equipment" className="space-y-3">
                  <h3 className="text-xl font-semibold mb-4">Equipamento Necessário</h3>
                  {exercise.equipment.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-foreground capitalize">{item}</span>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>

              {/* Botão de Iniciar */}
              <div className="mt-8 flex gap-4">
                <Button
                  onClick={startExercise}
                  className="flex-1 py-6 text-lg"
                  size="lg"
                >
                  <Play className="w-6 h-6 mr-2" />
                  Iniciar Exercício
                </Button>
                <Button
                  onClick={() => navigate('/exercise-library')}
                  variant="outline"
                  className="px-6"
                  size="lg"
                >
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExerciseDetail;
