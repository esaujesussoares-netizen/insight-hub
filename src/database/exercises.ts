// Database de exercícios com informações completas

export interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
  equipment: string[];
  duration: string;
  exercises: number;
  description: string;
  instructions: string[];
  animation: string;
  sets: number;
  reps: string;
  restTime: number;
  tips?: string[];
}

export const exerciseDatabase: Record<string, Exercise[]> = {
  'peito': [
    {
      id: 1,
      name: 'Supino Reto com Halteres',
      muscleGroup: 'peito',
      difficulty: 'iniciante',
      equipment: ['halteres', 'banco'],
      duration: '45-60min',
      exercises: 5,
      description: 'Exercício fundamental para desenvolvimento do peitoral',
      instructions: [
        'Deite-se no banco com os pés apoiados no chão',
        'Segure os halteres na altura do peito com palmas para frente',
        'Empurre os halteres para cima até estender os braços',
        'Desça controladamente até a posição inicial'
      ],
      animation: 'supino_reto',
      sets: 3,
      reps: '10-12',
      restTime: 60,
      tips: [
        'Mantenha os ombros estabilizados',
        'Não arquee excessivamente as costas',
        'Controle a descida por 2 segundos'
      ]
    },
    {
      id: 2,
      name: 'Crucifixo com Halteres',
      muscleGroup: 'peito',
      difficulty: 'intermediario',
      equipment: ['halteres', 'banco'],
      duration: '30-45min',
      exercises: 4,
      description: 'Excelente para alongamento e definição do peitoral',
      instructions: [
        'Deite-se no banco com halteres acima do peito',
        'Com cotovelos levemente flexionados, abra os braços',
        'Desça até sentir alongamento no peitoral',
        'Retorne à posição inicial contraindo o peito'
      ],
      animation: 'crucifixo',
      sets: 3,
      reps: '12-15',
      restTime: 45,
      tips: [
        'Mantenha uma leve flexão nos cotovelos',
        'Não desça demais para evitar lesões',
        'Foque na contração do peitoral'
      ]
    }
  ],
  
  'costas': [
    {
      id: 3,
      name: 'Remada com Halter',
      muscleGroup: 'costas',
      difficulty: 'iniciante',
      equipment: ['halteres', 'banco'],
      duration: '40-55min',
      exercises: 6,
      description: 'Desenvolve espessura das costas',
      instructions: [
        'Apoie joelho e mão no banco',
        'Segure o halter com braço estendido',
        'Puxe o halter em direção ao tronco',
        'Mantenha as costas retas durante o movimento'
      ],
      animation: 'remada_halter',
      sets: 4,
      reps: '8-12',
      restTime: 60,
      tips: [
        'Mantenha o core contraído',
        'Puxe com o cotovelo, não com a mão',
        'Evite rodar o tronco'
      ]
    },
    {
      id: 4,
      name: 'Barra Fixa',
      muscleGroup: 'costas',
      difficulty: 'intermediario',
      equipment: ['barra'],
      duration: '35-50min',
      exercises: 5,
      description: 'Exercício completo para desenvolvimento das costas',
      instructions: [
        'Segure a barra com pegada pronada',
        'Pendure-se com braços estendidos',
        'Puxe o corpo até o queixo passar da barra',
        'Desça controladamente'
      ],
      animation: 'barra_fixa',
      sets: 3,
      reps: '6-10',
      restTime: 90,
      tips: [
        'Mantenha o peito aberto',
        'Evite balançar o corpo',
        'Foque em puxar com as costas'
      ]
    }
  ],
  
  'pernas': [
    {
      id: 5,
      name: 'Agachamento Livre',
      muscleGroup: 'pernas',
      difficulty: 'iniciante',
      equipment: ['peso corporal'],
      duration: '50-65min',
      exercises: 7,
      description: 'Exercício completo para membros inferiores',
      instructions: [
        'Pés na largura dos ombros',
        'Desça como se fosse sentar',
        'Mantenha coluna ereta e peito aberto',
        'Volte à posição inicial contraindo glúteos'
      ],
      animation: 'agachamento_livre',
      sets: 4,
      reps: '12-15',
      restTime: 90,
      tips: [
        'Joelhos alinhados com os pés',
        'Não deixe os joelhos ultrapassarem os pés',
        'Mantenha o peso nos calcanhares'
      ]
    },
    {
      id: 6,
      name: 'Leg Press',
      muscleGroup: 'pernas',
      difficulty: 'iniciante',
      equipment: ['leg press'],
      duration: '45-60min',
      exercises: 6,
      description: 'Fortalece quadríceps e glúteos com segurança',
      instructions: [
        'Posicione os pés na plataforma',
        'Destrave a máquina',
        'Desça até formar 90 graus nos joelhos',
        'Empurre com os calcanhares'
      ],
      animation: 'leg_press',
      sets: 4,
      reps: '10-12',
      restTime: 75,
      tips: [
        'Mantenha a lombar apoiada',
        'Não trave os joelhos no topo',
        'Controle a descida'
      ]
    }
  ],
  
  'ombros': [
    {
      id: 7,
      name: 'Desenvolvimento com Halteres',
      muscleGroup: 'ombros',
      difficulty: 'iniciante',
      equipment: ['halteres'],
      duration: '40-50min',
      exercises: 5,
      description: 'Desenvolve força e volume dos ombros',
      instructions: [
        'Sente-se com halteres na altura dos ombros',
        'Empurre os halteres para cima',
        'Estenda os braços completamente',
        'Desça controladamente'
      ],
      animation: 'desenvolvimento',
      sets: 3,
      reps: '10-12',
      restTime: 60,
      tips: [
        'Mantenha o core contraído',
        'Não arquee as costas',
        'Controle o movimento'
      ]
    }
  ],
  
  'biceps': [
    {
      id: 8,
      name: 'Rosca Direta',
      muscleGroup: 'biceps',
      difficulty: 'iniciante',
      equipment: ['halteres'],
      duration: '30-40min',
      exercises: 4,
      description: 'Exercício clássico para bíceps',
      instructions: [
        'Fique em pé com halteres nas mãos',
        'Mantenha cotovelos junto ao corpo',
        'Flexione os braços elevando os halteres',
        'Desça controladamente'
      ],
      animation: 'rosca_direta',
      sets: 3,
      reps: '10-12',
      restTime: 45,
      tips: [
        'Não balance o corpo',
        'Mantenha os cotovelos fixos',
        'Controle a descida'
      ]
    }
  ],
  
  'triceps': [
    {
      id: 9,
      name: 'Tríceps Testa',
      muscleGroup: 'triceps',
      difficulty: 'intermediario',
      equipment: ['barra', 'banco'],
      duration: '35-45min',
      exercises: 4,
      description: 'Exercício eficaz para tríceps',
      instructions: [
        'Deite-se no banco segurando a barra',
        'Desça a barra em direção à testa',
        'Mantenha cotovelos fixos',
        'Estenda os braços completamente'
      ],
      animation: 'triceps_testa',
      sets: 3,
      reps: '10-12',
      restTime: 60,
      tips: [
        'Mantenha os cotovelos fixos',
        'Não abra os cotovelos',
        'Controle o movimento'
      ]
    }
  ],
  
  'gluteos': [
    {
      id: 10,
      name: 'Elevação Pélvica',
      muscleGroup: 'gluteos',
      difficulty: 'iniciante',
      equipment: ['peso corporal'],
      duration: '30-40min',
      exercises: 5,
      description: 'Fortalece e tonifica os glúteos',
      instructions: [
        'Deite-se de costas com joelhos flexionados',
        'Eleve o quadril contraindo os glúteos',
        'Mantenha no topo por 2 segundos',
        'Desça controladamente'
      ],
      animation: 'elevacao_pelvica',
      sets: 3,
      reps: '15-20',
      restTime: 45,
      tips: [
        'Contraia os glúteos no topo',
        'Não arquee demais as costas',
        'Mantenha o core ativo'
      ]
    }
  ],
  
  'abdomen': [
    {
      id: 11,
      name: 'Abdominal Supra',
      muscleGroup: 'abdomen',
      difficulty: 'iniciante',
      equipment: ['peso corporal'],
      duration: '20-30min',
      exercises: 6,
      description: 'Fortalece a região superior do abdômen',
      instructions: [
        'Deite-se de costas com joelhos flexionados',
        'Coloque as mãos atrás da cabeça',
        'Eleve o tronco contraindo o abdômen',
        'Desça controladamente'
      ],
      animation: 'abdominal_supra',
      sets: 3,
      reps: '15-20',
      restTime: 30,
      tips: [
        'Não puxe o pescoço',
        'Mantenha o queixo afastado do peito',
        'Expire na subida'
      ]
    }
  ],
  
  'cardio': [
    {
      id: 12,
      name: 'Corrida Intervalada',
      muscleGroup: 'cardio',
      difficulty: 'intermediario',
      equipment: ['esteira'],
      duration: '30-45min',
      exercises: 8,
      description: 'Treino cardiovascular de alta intensidade',
      instructions: [
        'Aqueça por 5 minutos em ritmo leve',
        'Alterne 1 min forte com 2 min leve',
        'Repita por 20-30 minutos',
        'Esfrie por 5 minutos'
      ],
      animation: 'corrida',
      sets: 8,
      reps: '1-2 min',
      restTime: 120,
      tips: [
        'Mantenha boa postura',
        'Respire ritmadamente',
        'Hidrate-se adequadamente'
      ]
    }
  ],
  
  'adutores': [
    {
      id: 13,
      name: 'Adução de Pernas',
      muscleGroup: 'adutores',
      difficulty: 'iniciante',
      equipment: ['máquina adutora'],
      duration: '25-35min',
      exercises: 4,
      description: 'Fortalece a parte interna das coxas',
      instructions: [
        'Sente-se na máquina adutora',
        'Posicione as pernas nas almofadas',
        'Junte as pernas contraindo os adutores',
        'Volte controladamente'
      ],
      animation: 'aducao',
      sets: 3,
      reps: '12-15',
      restTime: 45,
      tips: [
        'Mantenha as costas apoiadas',
        'Não use impulso',
        'Controle o movimento'
      ]
    }
  ]
};

// Função auxiliar para buscar exercício por ID
export const getExerciseById = (id: number): Exercise | undefined => {
  return Object.values(exerciseDatabase)
    .flat()
    .find(ex => ex.id === id);
};

// Função auxiliar para buscar exercícios por grupo muscular
export const getExercisesByMuscle = (muscleGroup: string): Exercise[] => {
  return exerciseDatabase[muscleGroup.toLowerCase()] || [];
};
