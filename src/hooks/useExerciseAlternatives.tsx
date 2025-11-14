import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

interface ExerciseAlternative {
  exerciseName: string;
  reason: string;
  difficulty?: string;
  equipmentNeeded?: string[];
}

interface AlternativesResponse {
  alternatives: ExerciseAlternative[];
  generalAdvice?: string;
}

export const useExerciseAlternatives = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [alternatives, setAlternatives] = useState<AlternativesResponse | null>(null);
  const { session } = useAuth();

  const fetchAlternatives = async (
    exerciseName: string,
    muscleGroup: string,
    difficulty?: string,
    reason?: string
  ) => {
    if (!session) {
      toast.error('You need to be logged in');
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-exercise-alternatives', {
        body: { exerciseName, muscleGroup, difficulty, reason },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setAlternatives(data);
      return data as AlternativesResponse;
    } catch (error) {
      console.error('Error fetching alternatives:', error);
      toast.error('Failed to load exercise alternatives');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearAlternatives = () => {
    setAlternatives(null);
  };

  return {
    isLoading,
    alternatives,
    fetchAlternatives,
    clearAlternatives
  };
};
