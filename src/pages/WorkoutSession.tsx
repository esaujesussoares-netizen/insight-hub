import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Pause, SkipForward, CheckCircle, Clock, Award, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WorkoutTimer from '@/components/WorkoutTimer';
import WorkoutProgress from '@/components/WorkoutProgress';
import ExercisePlayer from '@/components/ExercisePlayer';
import { getWorkoutDay, WorkoutDay } from '@/data/workoutPrograms';
import { toast } from 'sonner';

type WorkoutStatus = 'ready' | 'active' | 'paused' | 'completed';

const WorkoutSession: React.FC = () => {
  const { programId, dayId } = useParams<{ programId: string; dayId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [workout, setWorkout] = useState<WorkoutDay | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutStatus, setWorkoutStatus] = useState<WorkoutStatus>('ready');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedExercises, setCompletedExercises] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    // Try to get workout from location state first (from direct navigation)
    if (location.state?.workout) {
      setWorkout(location.state.workout);
    } else if (programId && dayId) {
      // Otherwise try to load from workout programs
      const loadedWorkout = getWorkoutDay(programId, dayId);
      if (loadedWorkout) {
        setWorkout(loadedWorkout);
      } else {
        toast.error('Treino não encontrado');
        navigate('/workouts');
      }
    } else {
      toast.error('Informações do treino ausentes');
      navigate('/workouts');
    }
  }, [programId, dayId, location.state, navigate]);

  useEffect(() => {
    if (workoutStatus === 'active') {
      const timer = setInterval(() => {
        setTotalTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [workoutStatus]);

  const currentExercise = workout?.exercises[currentExerciseIndex];
  const timerDuration = isResting && currentExercise ? currentExercise.restTime : 0;

  const startWorkout = () => {
    setWorkoutStatus('active');
    toast.success('Treino iniciado! Vamos lá! 💪');
  };

  if (!workout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg font-semibold">Carregando treino...</div>
        </div>
      </div>
    );
  }

  const handleTimerComplete = () => {
    if (isResting) {
      setIsResting(false);
      playSound();
    }
  };

  const handleNextSet = () => {
    const nextSet = currentSet + 1;
    
    if (nextSet >= currentExercise.sets) {
      // Exercise completed, move to next exercise
      handleNextExercise();
    } else {
      // Start rest period
      setCurrentSet(nextSet);
      setIsResting(true);
      playSound();
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(0);
      setIsResting(false);
      setCompletedExercises(prev => prev + 1);
      playSound();
      toast.success('Exercício concluído! Próximo exercício.');
    } else {
      // Workout completed
      finishWorkout();
    }
  };

  const finishWorkout = () => {
    const minutes = Math.floor(totalTime / 60);
    const caloriesBurned = Math.round((workout.exercises.length * 50) + (totalTime / 60) * 8);
    
    toast.success('🎉 Treino concluído com sucesso!', {
      description: `Tempo total: ${minutes} min | Calorias: ~${caloriesBurned} kcal`
    });
    
    navigate('/progress', { 
      state: { 
        workoutCompleted: true,
        workoutName: workout.name,
        duration: totalTime,
        calories: caloriesBurned
      } 
    });
  };

  const playSound = () => {
    if (soundEnabled) {
      const audio = new Audio('/sounds/beep.mp3');
      audio.play().catch(() => {});
    }
  };

  const togglePause = () => {
    if (workoutStatus === 'active') {
      setWorkoutStatus('paused');
      toast.info('Treino pausado');
    } else if (workoutStatus === 'paused') {
      setWorkoutStatus('active');
      toast.info('Treino retomado');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      {workoutStatus !== 'ready' && (
        <div className="bg-card border-b sticky top-0 z-10 backdrop-blur-sm bg-card/95">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Tem certeza que deseja sair do treino?')) {
                    navigate(-1);
                  }
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Sair
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-muted-foreground">
                  {formatTime(totalTime)}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
            
            <WorkoutProgress
              totalExercises={workout.exercises.length}
              completedExercises={completedExercises}
              currentExercise={currentExerciseIndex}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Ready State - Tela Inicial */}
        {workoutStatus === 'ready' && (
          <div className="text-center py-12">
            <div className="bg-card rounded-2xl p-8 max-w-md mx-auto border shadow-sm">
              <Award className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">{workout.name}</h2>
              <p className="text-muted-foreground mb-4">{workout.focus}</p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {workout.duration}
                </span>
                <span>•</span>
                <span>{workout.exercises.length} exercícios</span>
              </div>
              <Button
                onClick={startWorkout}
                size="lg"
                className="w-full h-14 text-base"
              >
                <Play className="w-6 h-6 mr-2" />
                Iniciar Treino
              </Button>
            </div>
          </div>
        )}

        {/* Active/Paused State - Treino em Andamento */}
        {(workoutStatus === 'active' || workoutStatus === 'paused') && currentExercise && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Player do Exercício */}
            <div className="space-y-6">
              <ExercisePlayer
                exercise={currentExercise}
                currentSet={currentSet}
                isResting={isResting}
              />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={togglePause}
                  variant="outline"
                  size="lg"
                  className="flex-1 h-12"
                >
                  {workoutStatus === 'paused' ? (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Retomar
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pausar
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleNextExercise}
                  variant="outline"
                  size="lg"
                  className="h-12"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              {!isResting && (
                <Button
                  onClick={handleNextSet}
                  className="w-full h-14 text-lg"
                  size="lg"
                  disabled={workoutStatus === 'paused'}
                >
                  {currentSet < currentExercise.sets - 1 
                    ? `Concluir Série ${currentSet + 1}` 
                    : 'Concluir Exercício'}
                </Button>
              )}
            </div>

            {/* Timer e Próximos Exercícios */}
            <div className="space-y-6">
              {/* Timer Section */}
              {isResting && (
                <div className="flex justify-center">
                  <WorkoutTimer
                    initialTime={timerDuration}
                    isResting={isResting}
                    onComplete={handleTimerComplete}
                    isPaused={workoutStatus === 'paused'}
                    onTogglePause={togglePause}
                  />
                </div>
              )}

              {/* Workout Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-card rounded-xl p-4 text-center border">
                  <div className="text-2xl font-bold text-primary">{completedExercises}</div>
                  <div className="text-xs text-muted-foreground">Exercícios</div>
                </div>
                <div className="bg-card rounded-xl p-4 text-center border">
                  <div className="text-2xl font-bold text-green-500">{formatTime(totalTime)}</div>
                  <div className="text-xs text-muted-foreground">Tempo</div>
                </div>
                <div className="bg-card rounded-xl p-4 text-center border">
                  <div className="text-2xl font-bold text-orange-500">
                    {Math.round((completedExercises * 50) + (totalTime / 60) * 8)}
                  </div>
                  <div className="text-xs text-muted-foreground">Calorias</div>
                </div>
              </div>

              {/* Próximos Exercícios */}
              <div className="bg-card rounded-xl p-6 border">
                <h3 className="font-semibold mb-4 text-lg">Próximos Exercícios</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {workout.exercises.slice(currentExerciseIndex + 1).map((exercise, index) => (
                    <div key={exercise.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                        {currentExerciseIndex + index + 2}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{exercise.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {exercise.sets}×{exercise.reps} • {exercise.restTime}s descanso
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completed State - Treino Concluído */}
        {workoutStatus === 'completed' && (
          <div className="text-center py-12">
            <div className="bg-card rounded-2xl p-8 max-w-md mx-auto border shadow-sm">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Treino Concluído! 🎉</h2>
              <p className="text-muted-foreground mb-6">
                Você completou {workout.exercises.length} exercícios em {formatTime(totalTime)}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6 text-left">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Tempo Total</div>
                  <div className="text-xl font-bold">{formatTime(totalTime)}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Calorias</div>
                  <div className="text-xl font-bold text-orange-500">
                    ~{Math.round((workout.exercises.length * 50) + (totalTime / 60) * 8)}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/progress')}
                  className="flex-1"
                  size="lg"
                >
                  Ver Progresso
                </Button>
                <Button
                  onClick={() => navigate('/workouts')}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutSession;
