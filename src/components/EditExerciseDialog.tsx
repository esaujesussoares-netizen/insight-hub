import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/untyped';
import { toast } from 'sonner';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  difficulty: string | null;
  description: string | null;
  gif_url: string | null;
  equipment: any;
  sets: number | null;
  reps: string | null;
  rest_time: number | null;
  duration: string | null;
  instructions: any;
  tips: any;
}

interface EditExerciseDialogProps {
  exercise: Exercise;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditExerciseDialog: React.FC<EditExerciseDialogProps> = ({
  exercise,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: exercise.name,
    muscle_group: exercise.muscle_group,
    difficulty: exercise.difficulty || '',
    description: exercise.description || '',
    sets: exercise.sets || 3,
    reps: exercise.reps || '10-12',
    rest_time: exercise.rest_time || 60,
    duration: exercise.duration || '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(exercise.gif_url);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const muscleGroups = [
    { value: 'peito', label: 'Peito' },
    { value: 'costas', label: 'Costas' },
    { value: 'pernas', label: 'Pernas' },
    { value: 'ombros', label: 'Ombros' },
    { value: 'bracos', label: 'Braços' },
    { value: 'abdomen', label: 'Abdômen' },
    { value: 'gluteos', label: 'Glúteos' },
    { value: 'antebracos', label: 'Antebraços' },
    { value: 'cardio', label: 'Cardio' },
  ];

  const difficulties = [
    { value: 'iniciante', label: 'Iniciante' },
    { value: 'intermediário', label: 'Intermediário' },
    { value: 'avançado', label: 'Avançado' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem (GIF, PNG, JPG)');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let gifUrl = exercise.gif_url;

      // Upload new GIF if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${formData.muscle_group}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('exercise-gifs')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('exercise-gifs')
          .getPublicUrl(filePath);

        gifUrl = publicUrl;
      }

      // Update exercise
      const { error: updateError } = await supabase
        .from('exercise_library')
        .update({
          name: formData.name,
          muscle_group: formData.muscle_group,
          difficulty: formData.difficulty || null,
          description: formData.description || null,
          sets: formData.sets,
          reps: formData.reps,
          rest_time: formData.rest_time,
          duration: formData.duration || null,
          gif_url: gifUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', exercise.id);

      if (updateError) throw updateError;

      toast.success('Exercício atualizado com sucesso!');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar exercício:', error);
      toast.error('Erro ao atualizar exercício');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Exercício</DialogTitle>
          <DialogDescription>
            Atualize as informações do exercício e substitua o GIF se necessário
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* GIF Upload */}
          <div className="space-y-2">
            <Label>GIF do Exercício</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-contain rounded-lg bg-muted/30"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Alterar GIF
                  </Button>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-8 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Clique para fazer upload do GIF</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    GIF, PNG ou JPG (máx. 10MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Exercício *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Muscle Group & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Grupo Muscular *</Label>
              <Select
                value={formData.muscle_group}
                onValueChange={(value) => setFormData({ ...formData, muscle_group: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {muscleGroups.map((group) => (
                    <SelectItem key={group.value} value={group.value}>
                      {group.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dificuldade</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((diff) => (
                    <SelectItem key={diff.value} value={diff.value}>
                      {diff.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Sets, Reps, Rest */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sets">Séries</Label>
              <Input
                id="sets"
                type="number"
                min="1"
                value={formData.sets}
                onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reps">Repetições</Label>
              <Input
                id="reps"
                value={formData.reps}
                onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rest_time">Descanso (s)</Label>
              <Input
                id="rest_time"
                type="number"
                min="0"
                value={formData.rest_time}
                onChange={(e) => setFormData({ ...formData, rest_time: parseInt(e.target.value) })}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duração (opcional)</Label>
            <Input
              id="duration"
              placeholder="Ex: 30 segundos"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditExerciseDialog;
