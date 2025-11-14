import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, Lightbulb } from 'lucide-react';
import { useExerciseAlternatives } from '@/hooks/useExerciseAlternatives';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExerciseAlternativesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  muscleGroup: string;
  difficulty?: string;
  onSelectAlternative?: (exerciseName: string) => void;
}

export const ExerciseAlternativesDialog = ({
  open,
  onOpenChange,
  exerciseName,
  muscleGroup,
  difficulty,
  onSelectAlternative,
}: ExerciseAlternativesDialogProps) => {
  const [reason, setReason] = useState('');
  const { isLoading, alternatives, fetchAlternatives } = useExerciseAlternatives();

  const handleFindAlternatives = async () => {
    await fetchAlternatives(exerciseName, muscleGroup, difficulty, reason);
  };

  const handleSelect = (altName: string) => {
    onSelectAlternative?.(altName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Find Alternative Exercises</DialogTitle>
          <DialogDescription>
            Can't do {exerciseName}? Let's find you better alternatives for {muscleGroup}.
          </DialogDescription>
        </DialogHeader>

        {!alternatives ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Why can't you do this exercise? (optional)
              </label>
              <Textarea
                placeholder="e.g., I have knee pain, No equipment available, Too difficult..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <Button
              onClick={handleFindAlternatives}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding alternatives...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Find Alternatives
                </>
              )}
            </Button>
          </div>
        ) : (
          <ScrollArea className="max-h-[50vh]">
            <div className="space-y-4">
              {alternatives.generalAdvice && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="text-muted-foreground">{alternatives.generalAdvice}</p>
                </div>
              )}

              <div className="space-y-3">
                {alternatives.alternatives.map((alt, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="font-semibold">{alt.exerciseName}</h4>
                        {alt.difficulty && (
                          <Badge variant="outline" className="mt-1">
                            {alt.difficulty}
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSelect(alt.exerciseName)}
                      >
                        Use This
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {alt.reason}
                    </p>

                    {alt.equipmentNeeded && alt.equipmentNeeded.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {alt.equipmentNeeded.map((equip, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {equip}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
