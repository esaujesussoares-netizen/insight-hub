export interface Exercise {
  id: number;
  name: string;
  type: 'principal' | 'auxiliar' | 'finalizacao' | 'composto' | 'isolado';
  sets: number;
  reps: string;
  restTime: number;
  animation: string;
  instructions: string[];
  muscleGroup: string;
  equipment: string[];
  videoUrl?: string;
}

export interface WorkoutDay {
  id: string;
  name: string;
  focus: string;
  duration: string;
  exercises: Exercise[];
}

export interface WorkoutPhase {
  name: string;
  weeks: number;
  days: WorkoutDay[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  focus: string;
  level: string;
  duration: string;
  daysPerWeek: number;
  phases: WorkoutPhase[];
}

export const workoutPrograms: Record<string, WorkoutProgram> = {
  'hipertrofia_balanceado': {
    id: 'hipertrofia_balanceado',
    name: 'Hipertrofia - Balanceado',
    focus: 'Ganho de massa muscular equilibrado',
    level: 'Iniciante',
    duration: '8 semanas',
    daysPerWeek: 4,
    phases: [
      {
        name: 'Fase 1: Resistência',
        weeks: 4,
        days: [
          {
            id: 'dia1_fundamentos',
            name: 'Dia 1 - Fundamentos',
            focus: 'Técnica e resistência',
            duration: '60min',
            exercises: [
              {
                id: 1,
                name: 'Supino Reto com Halteres',
                type: 'principal',
                sets: 4,
                reps: '12',
                restTime: 60,
                animation: 'supino_reto',
                instructions: [
                  'Deite-se no banco com pés apoiados',
                  'Segure halteres na altura do peito',
                  'Empurre para cima até extensão completa',
                  'Desça controladamente por 2 segundos'
                ],
                muscleGroup: 'peito',
                equipment: ['halteres', 'banco'],
                videoUrl: '/videos/supino-reto.mp4'
              },
              {
                id: 2,
                name: 'Remada Curvada com Barra',
                type: 'principal',
                sets: 4,
                reps: '10',
                restTime: 60,
                animation: 'remada_barra',
                instructions: [
                  'Pés na largura dos ombros, joelhos flexionados',
                  'Incline tronco à 45°, costas retas',
                  'Puxe barra em direção ao abdômen',
                  'Contraia as costas no topo do movimento'
                ],
                muscleGroup: 'costas',
                equipment: ['barra', 'pesos']
              },
              {
                id: 3,
                name: 'Desenvolvimento com Halteres',
                type: 'auxiliar',
                sets: 3,
                reps: '15',
                restTime: 45,
                animation: 'desenvolvimento_halteres',
                instructions: [
                  'Sente-se no banco com costas retas',
                  'Segure halteres na altura dos ombros',
                  'Empurre para cima até braços estendidos',
                  'Desça controladamente'
                ],
                muscleGroup: 'ombros',
                equipment: ['halteres', 'banco']
              },
              {
                id: 4,
                name: 'Rosca Direta com Barra',
                type: 'auxiliar',
                sets: 3,
                reps: '12',
                restTime: 45,
                animation: 'rosca_direta',
                instructions: [
                  'Em pé, pés na largura dos ombros',
                  'Segure barra com pegada supinada',
                  'Flexione cotovelos levando barra ao ombro',
                  'Desça controladamente'
                ],
                muscleGroup: 'biceps',
                equipment: ['barra', 'pesos']
              },
              {
                id: 5,
                name: 'Tríceps Testa com Halteres',
                type: 'finalizacao',
                sets: 4,
                reps: '20',
                restTime: 30,
                animation: 'triceps_testa',
                instructions: [
                  'Deitado no banco, braços estendidos',
                  'Flexione cotovelos levando halteres à testa',
                  'Estenda braços à posição inicial',
                  'Mantenha cotovelos fixos'
                ],
                muscleGroup: 'triceps',
                equipment: ['halteres', 'banco']
              }
            ]
          },
          {
            id: 'dia2_forca',
            name: 'Dia 2 - Força',
            focus: 'Desenvolvimento de força máxima',
            duration: '75min',
            exercises: [
              {
                id: 6,
                name: 'Agachamento Livre',
                type: 'composto',
                sets: 5,
                reps: '6',
                restTime: 90,
                animation: 'agachamento_livre',
                instructions: [
                  'Pés na largura dos ombros',
                  'Desça como se fosse sentar',
                  'Joelhos alinhados com pés',
                  'Volte à posição inicial contraindo glúteos'
                ],
                muscleGroup: 'pernas',
                equipment: ['peso corporal']
              },
              {
                id: 7,
                name: 'Levantamento Terra',
                type: 'composto',
                sets: 4,
                reps: '8',
                restTime: 90,
                animation: 'levantamento_terra',
                instructions: [
                  'Pés sob a barra, agache-se',
                  'Pegada na largura dos ombros',
                  'Mantenha costas retas ao levantar',
                  'Contraia glúteos no topo'
                ],
                muscleGroup: 'costas',
                equipment: ['barra', 'pesos']
              },
              {
                id: 8,
                name: 'Elevação Lateral',
                type: 'isolado',
                sets: 4,
                reps: '12',
                restTime: 45,
                animation: 'elevacao_lateral',
                instructions: [
                  'Em pé, segure halteres ao lado do corpo',
                  'Eleve braços até altura dos ombros',
                  'Mantenha cotovelos levemente flexionados',
                  'Desça controladamente'
                ],
                muscleGroup: 'ombros',
                equipment: ['halteres']
              }
            ]
          }
        ]
      }
    ]
  }
};

export const getWorkoutProgram = (id: string): WorkoutProgram | undefined => {
  return workoutPrograms[id];
};

export const getWorkoutDay = (programId: string, dayId: string): WorkoutDay | undefined => {
  const program = getWorkoutProgram(programId);
  if (!program) return undefined;
  
  for (const phase of program.phases) {
    const day = phase.days.find(d => d.id === dayId);
    if (day) return day;
  }
  
  return undefined;
};
