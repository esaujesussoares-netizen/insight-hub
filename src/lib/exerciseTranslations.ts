// Mapeamento de nomes de exercícios em inglês para português brasileiro
export const exerciseTranslations: Record<string, string> = {
  // Exercícios cardiovasculares
  "Burpees": "Burpees",
  "Mountain Climbers": "Escalador",
  "Jumping Jacks": "Polichinelos",
  "High Knees": "Corrida Parada",
  "Running": "Corrida",
  "Jump Rope": "Pular Corda",
  "Box Jumps": "Salto no Caixote",
  
  // Peito
  "Push-ups": "Flexões",
  "Bench Press": "Supino Reto",
  "Incline Bench Press": "Supino Inclinado",
  "Decline Bench Press": "Supino Declinado",
  "Dumbbell Flyes": "Crucifixo com Halteres",
  "Cable Crossover": "Crucifixo na Polia",
  
  // Costas
  "Pull-ups": "Barra Fixa",
  "Barbell Rows": "Remada Curvada",
  "Lat Pulldown": "Puxada Alta",
  "Deadlift": "Levantamento Terra",
  "T-Bar Row": "Remada T",
  "Seated Cable Row": "Remada Sentada",
  
  // Pernas
  "Squats": "Agachamento",
  "Leg Press": "Leg Press",
  "Lunges": "Afundo",
  "Leg Extension": "Cadeira Extensora",
  "Leg Curl": "Mesa Flexora",
  "Calf Raises": "Panturrilha em Pé",
  
  // Ombros
  "Shoulder Press": "Desenvolvimento",
  "Lateral Raises": "Elevação Lateral",
  "Front Raises": "Elevação Frontal",
  "Rear Delt Flyes": "Crucifixo Invertido",
  
  // Braços
  "Bicep Curls": "Rosca Direta",
  "Hammer Curls": "Rosca Martelo",
  "Tricep Dips": "Mergulho",
  "Tricep Pushdown": "Tríceps Pulley",
  "Overhead Extension": "Extensão Francesa",
  
  // Abdômen
  "Crunches": "Abdominal Supra",
  "Plank": "Prancha",
  "Russian Twists": "Russian Twist",
  "Leg Raises": "Elevação de Pernas",
  "Bicycle Crunches": "Abdominal Bicicleta",
  "Side Plank": "Prancha Lateral",
  
  // Funcional
  "Kettlebell Swings": "Swing com Kettlebell",
  "Battle Ropes": "Cordas Navais",
  "Medicine Ball Slams": "Arremesso de Medicine Ball",
  "Box Step-ups": "Step Up",
  
  // Rest
  "Rest": "Descanso"
};

// Função para traduzir nome do exercício
export const translateExercise = (exerciseName: string): string => {
  return exerciseTranslations[exerciseName] || exerciseName;
};
