import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/untyped';

interface AnimatedExerciseProps {
  animation: string;
  size?: 'small' | 'medium' | 'large';
}

const AnimatedExercise: React.FC<AnimatedExerciseProps> = ({ animation, size = 'medium' }) => {
  const [gifUrl, setGifUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const sizeClass = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64'
  };

  useEffect(() => {
    const fetchGif = async () => {
      if (!animation) {
        setLoading(false);
        return;
      }

      try {
        // Normaliza o nome do exercício removendo palavras comuns e caracteres especiais
        const cleanName = animation
          .toLowerCase()
          .replace(/\s+(com|de|na|no|em|para|usando)\s+/g, '_') // Remove palavras conectivas
          .replace(/\s+/g, '_') // Substitui espaços por underscores
          .replace(/[àáâã]/g, 'a')
          .replace(/[éê]/g, 'e')
          .replace(/[íî]/g, 'i')
          .replace(/[óôõ]/g, 'o')
          .replace(/[úû]/g, 'u')
          .replace(/ç/g, 'c')
          .trim();

        // Cria variações do nome para busca
        const searchVariations = [
          animation, // Nome original
          cleanName, // Nome limpo com underscores
          cleanName.replace(/_/g, ' '), // Nome limpo com espaços
        ];

        // Busca no banco usando ILIKE para encontrar correspondências flexíveis
        const { data: allExercises, error } = await supabase
          .from('exercise_library')
          .select('gif_url,name')
          .limit(100);

        if (error) {
          console.error('Erro ao buscar exercícios:', error);
          return;
        }

        // Busca o melhor match
        let bestMatch = null;
        let bestScore = 0;

        for (const exercise of allExercises || []) {
          const dbName = exercise.name.toLowerCase();
          
          // Calcula score de similaridade
          for (const variation of searchVariations) {
            const searchLower = variation.toLowerCase();
            
            // Match exato
            if (dbName === searchLower || dbName.replace(/_/g, ' ') === searchLower) {
              bestMatch = exercise;
              bestScore = 100;
              break;
            }
            
            // Contém todas as palavras principais
            const searchWords = searchLower.split(/[_\s]+/).filter(w => w.length > 2);
            const dbWords = dbName.split(/[_\s]+/);
            const matchingWords = searchWords.filter(w => dbWords.some(dbW => dbW.includes(w) || w.includes(dbW)));
            
            const score = (matchingWords.length / searchWords.length) * 100;
            
            if (score > bestScore && score >= 60) { // Mínimo 60% de similaridade
              bestScore = score;
              bestMatch = exercise;
            }
          }
          
          if (bestScore === 100) break;
        }

        if (bestMatch?.gif_url) {
          setGifUrl(bestMatch.gif_url);
          console.log(`✅ GIF encontrado: "${animation}" → "${bestMatch.name}" (${bestScore}%)`);
        } else {
          console.warn('❌ GIF não encontrado para:', animation, 'Variações:', searchVariations);
        }
      } catch (error) {
        console.error('Erro ao buscar GIF:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGif();
  }, [animation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className={`${sizeClass[size]} flex items-center justify-center bg-muted/50 rounded-lg`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      {gifUrl ? (
        <img 
          src={gifUrl} 
          alt={animation}
          className={`${sizeClass[size]} object-contain rounded-lg shadow-lg bg-muted/30`}
        />
      ) : (
        <div className={`${sizeClass[size]} flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/30`}>
          <div className="text-center p-4">
            <p className="text-sm font-medium text-muted-foreground">GIF pendente</p>
            <p className="text-xs text-muted-foreground/70 mt-1">{animation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimatedExercise;
