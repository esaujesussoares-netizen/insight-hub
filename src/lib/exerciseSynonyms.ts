// Dicionário de sinônimos e traduções para matching de exercícios
export const exerciseSynonyms: Record<string, string[]> = {
  // Peito/Chest
  "supino": ["bench press", "press", "supino reto", "supino horizontal"],
  "bench press": ["supino", "press", "supino reto"],
  "supino inclinado": ["incline bench press", "incline press"],
  "incline bench press": ["supino inclinado", "incline press"],
  "supino declinado": ["decline bench press", "decline press"],
  "crucifixo": ["dumbbell fly", "fly", "flyes"],
  "dumbbell fly": ["crucifixo", "fly", "flyes"],
  
  // Costas/Back
  "remada": ["row", "rows", "remada curvada"],
  "row": ["remada", "rows"],
  "barra fixa": ["pull up", "pullup", "chin up"],
  "pull up": ["barra fixa", "pullup", "chin up"],
  "pulldown": ["puxada", "lat pulldown"],
  "puxada": ["pulldown", "lat pulldown"],
  "levantamento terra": ["deadlift", "terra"],
  "deadlift": ["levantamento terra", "terra"],
  
  // Pernas/Legs
  "agachamento": ["squat", "squats"],
  "squat": ["agachamento", "squats"],
  "leg press": ["pressao de pernas", "pressão pernas"],
  "pressao de pernas": ["leg press", "pressão pernas"],
  "cadeira extensora": ["leg extension", "extensora"],
  "leg extension": ["cadeira extensora", "extensora"],
  "cadeira flexora": ["leg curl", "flexora"],
  "leg curl": ["cadeira flexora", "flexora"],
  "aducao": ["adduction", "adução"],
  "adduction": ["aducao", "adução"],
  "gluteo": ["glute", "glutes", "glúteo"],
  "glute bridge": ["elevacao pelvica", "elevação pélvica", "ponte gluteo"],
  
  // Ombros/Shoulders
  "desenvolvimento": ["shoulder press", "press militar", "military press"],
  "shoulder press": ["desenvolvimento", "press militar"],
  "elevacao lateral": ["lateral raise", "elevação lateral"],
  "lateral raise": ["elevacao lateral", "elevação lateral"],
  "elevacao frontal": ["front raise", "elevação frontal"],
  "encolhimento": ["shrugs", "trapezio"],
  "shrugs": ["encolhimento", "trapezio", "trapézio"],
  
  // Bíceps/Biceps
  "rosca": ["curl", "curls", "rosca direta"],
  "curl": ["rosca", "curls"],
  "rosca alternada": ["alternate curl", "alternating curl"],
  "rosca martelo": ["hammer curl"],
  "hammer curl": ["rosca martelo"],
  
  // Tríceps/Triceps
  "triceps": ["tricep", "tríceps"],
  "tricep": ["triceps", "tríceps"],
  "testa": ["skullcrusher", "skull crusher"],
  "skullcrusher": ["testa", "rosca testa"],
  "mergulho": ["dips", "paralela"],
  "dips": ["mergulho", "paralela"],
  
  // Abdômen/Abs
  "abdominal": ["crunch", "crunches", "abs"],
  "crunch": ["abdominal", "abs"],
  "prancha": ["plank"],
  "plank": ["prancha"],
  "flexao": ["flexão", "push up", "pushup"],
  "push up": ["flexao", "flexão"],
  
  // Cardio
  "corrida": ["running", "run", "treadmill"],
  "running": ["corrida", "run"],
  "esteira": ["treadmill", "running"],
  "bike": ["bicicleta", "cycling"],
  "bicicleta": ["bike", "cycling"],
};

// Função para obter todos os sinônimos de uma palavra
export const getSynonyms = (word: string): string[] => {
  const normalized = word.toLowerCase().trim();
  return exerciseSynonyms[normalized] || [];
};

// Função para verificar se duas palavras são sinônimas
export const areSynonyms = (word1: string, word2: string): boolean => {
  const norm1 = word1.toLowerCase().trim();
  const norm2 = word2.toLowerCase().trim();
  
  if (norm1 === norm2) return true;
  
  const synonyms1 = getSynonyms(norm1);
  const synonyms2 = getSynonyms(norm2);
  
  return synonyms1.includes(norm2) || synonyms2.includes(norm1);
};
