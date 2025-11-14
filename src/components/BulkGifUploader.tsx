import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, CheckCircle2, Loader2, FileImage, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/untyped";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getSynonyms, areSynonyms } from "@/lib/exerciseSynonyms";

interface UploadFile {
  file: File;
  fileName: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  selectedExerciseId?: string;
  selectedExerciseName?: string;
  searchTerm?: string;
  preview?: string;
}

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
}

interface BulkGifUploaderProps {
  onComplete?: () => void;
  selectedMuscleGroup?: string;
}

const muscleGroups = [
  { value: 'all', label: 'Todos' },
  { value: 'peito', label: 'Peito' },
  { value: 'costas', label: 'Costas' },
  { value: 'pernas', label: 'Pernas' },
  { value: 'ombros', label: 'Ombros' },
  { value: 'biceps', label: 'Bíceps' },
  { value: 'triceps', label: 'Tríceps' },
  { value: 'abdomen', label: 'Abdômen' },
  { value: 'gluteos', label: 'Glúteos' },
  { value: 'antebraco', label: 'Antebraço' },
  { value: 'cardio', label: 'Cardio' },
];

const muscleGroupMapping: Record<string, string[]> = {
  'peito': ['peito', 'peitoral', 'chest'],
  'costas': ['costas', 'back', 'dorsal'],
  'pernas': ['pernas', 'perna', 'legs', 'quadriceps', 'posterior', 'coxa'],
  'ombros': ['ombros', 'ombro', 'shoulders', 'deltoide'],
  'biceps': ['biceps', 'bíceps', 'braquial'],
  'triceps': ['triceps', 'tríceps'],
  'abdomen': ['abdomen', 'abdômen', 'abs', 'abdominal'],
  'gluteos': ['gluteos', 'glúteos', 'glutes', 'gluteo'],
  'antebraco': ['antebraco', 'antebraço', 'forearm', 'antebracos'],
  'cardio': ['cardio', 'cardiovascular', 'aerobico']
};

export function BulkGifUploader({ onComplete, selectedMuscleGroup }: BulkGifUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [muscleGroupFilter, setMuscleGroupFilter] = useState(selectedMuscleGroup || 'all');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    if (selectedMuscleGroup) {
      setMuscleGroupFilter(selectedMuscleGroup);
    }
  }, [selectedMuscleGroup]);

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const norm1 = normalizeText(str1);
    const norm2 = normalizeText(str2);

    if (norm1 === norm2) return 100;
    if (norm1.includes(norm2) || norm2.includes(norm1)) return 90;

    const words1 = norm1.split(' ');
    const words2 = norm2.split(' ');
    
    let matchScore = 0;
    let totalWords = Math.max(words1.length, words2.length);
    
    words1.forEach(word1 => {
      words2.forEach(word2 => {
        if (word1 === word2) {
          matchScore += 1;
        } else if (word1.includes(word2) || word2.includes(word1)) {
          matchScore += 0.8;
        } else if (areSynonyms(word1, word2)) {
          matchScore += 0.95;
        } else {
          const synonyms1 = getSynonyms(word1);
          const synonyms2 = getSynonyms(word2);
          
          if (synonyms1.some(s => s.includes(word2) || word2.includes(s))) {
            matchScore += 0.7;
          } else if (synonyms2.some(s => s.includes(word1) || word1.includes(s))) {
            matchScore += 0.7;
          }
        }
      });
    });

    if (matchScore === 0) return 0;

    const similarity = (matchScore / totalWords) * 100;
    return Math.min(similarity, 100);
  };

  const findBestMatch = (fileName: string): Exercise | null => {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    
    let bestMatch: Exercise | null = null;
    let bestScore = 0;

    exercises.forEach(exercise => {
      const score = calculateSimilarity(nameWithoutExt, exercise.name);
      
      if (score > bestScore && score >= 50) {
        bestScore = score;
        bestMatch = exercise;
      }
    });

    return bestMatch;
  };

  const fetchExercises = async () => {
    setIsLoadingExercises(true);
    const { data, error } = await supabase
      .from("exercise_library")
      .select("id, name, muscle_group");

    if (error) {
      toast.error("Erro ao carregar exercícios");
      setIsLoadingExercises(false);
      return;
    }

    setExercises(data as Exercise[]);
    setIsLoadingExercises(false);
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles = Array.from(selectedFiles)
      .filter(file => file.type === 'image/gif')
      .map(file => {
        const bestMatch = findBestMatch(file.name);
        const preview = URL.createObjectURL(file);
        
        return {
          file,
          fileName: file.name,
          status: 'pending' as const,
          selectedExerciseId: bestMatch?.id,
          selectedExerciseName: bestMatch?.name,
          searchTerm: '',
          preview
        };
      });

    if (newFiles.length === 0) {
      toast.error("Selecione apenas arquivos GIF");
      return;
    }

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const updateFileExercise = (index: number, exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      setFiles(prev => {
        const newFiles = [...prev];
        newFiles[index].selectedExerciseId = exerciseId;
        newFiles[index].selectedExerciseName = exercise.name;
        return newFiles;
      });
    }
  };

  const updateFileSearchTerm = (index: number, searchTerm: string) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[index].searchTerm = searchTerm;
      return newFiles;
    });
  };

  const uploadSingleFile = async (uploadFile: UploadFile): Promise<void> => {
    if (!uploadFile.selectedExerciseId) {
      throw new Error("Nenhum exercício selecionado");
    }

    const fileExt = uploadFile.file.name.split('.').pop();
    const fileName = `${uploadFile.selectedExerciseId}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("exercise-gifs")
      .upload(filePath, uploadFile.file, {
        upsert: true,
        contentType: 'image/gif',
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("exercise-gifs")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("exercise_library")
      .update({ gif_url: publicUrl })
      .eq("id", uploadFile.selectedExerciseId);

    if (updateError) {
      throw updateError;
    }
  };

  const startUpload = async () => {
    const filesToUpload = files.filter(f => f.status === 'pending' && f.selectedExerciseId);
    
    if (filesToUpload.length === 0) {
      toast.error("Selecione exercícios para todos os GIFs");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    let completed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.status !== 'pending' || !file.selectedExerciseId) {
        continue;
      }

      setFiles(prev => {
        const newFiles = [...prev];
        newFiles[i].status = 'uploading';
        return newFiles;
      });

      try {
        await uploadSingleFile(file);
        
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i].status = 'success';
          return newFiles;
        });
        
        completed++;
        setUploadProgress((completed / filesToUpload.length) * 100);
        
      } catch (error: any) {
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i].status = 'error';
          newFiles[i].error = error.message;
          return newFiles;
        });
      }
    }

    setUploading(false);
    
    const successCount = files.filter(f => f.status === 'success').length;
    const errorCount = files.filter(f => f.status === 'error').length;
    
    if (successCount > 0) {
      toast.success(`${successCount} GIF${successCount > 1 ? 's' : ''} enviado${successCount > 1 ? 's' : ''} com sucesso!`);
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} GIF${errorCount > 1 ? 's' : ''} com erro`);
    }

    if (onComplete) {
      onComplete();
    }
  };

  const getFilteredExercises = (file: UploadFile) => {
    const searchTerm = normalizeText(file.searchTerm || '');
    
    if (!searchTerm) {
      // Se não há busca, filtra apenas por grupo muscular
      if (muscleGroupFilter === 'all') {
        return exercises.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      const filterKeywords = muscleGroupMapping[muscleGroupFilter] || [muscleGroupFilter];
      return exercises
        .filter(ex => filterKeywords.some(keyword => 
          normalizeText(ex.muscle_group).includes(keyword)
        ))
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // Busca inteligente: por nome, sinônimos e grupo muscular
    const searchTokens = searchTerm.split(' ').filter(t => t.length > 0);
    
    return exercises
      .filter(ex => {
        const exerciseName = normalizeText(ex.name);
        const exerciseGroup = normalizeText(ex.muscle_group);
        const nameTokens = exerciseName.split(' ');
        
        // 1. Busca por correspondência de nome (tokens)
        const nameMatch = searchTokens.some(searchToken => 
          nameTokens.some(nameToken => 
            nameToken.includes(searchToken) || searchToken.includes(nameToken)
          )
        );
        
        // 2. Busca por sinônimos
        const synonymMatch = searchTokens.some(searchToken => {
          const synonyms = getSynonyms(searchToken);
          return nameTokens.some(nameToken => 
            areSynonyms(searchToken, nameToken) || 
            synonyms.some(syn => normalizeText(syn).includes(nameToken) || nameToken.includes(normalizeText(syn)))
          );
        });
        
        // 3. Busca por grupo muscular digitado
        const groupMatch = Object.entries(muscleGroupMapping).some(([group, keywords]) => {
          const groupMatches = keywords.some(keyword => 
            normalizeText(keyword).includes(searchTerm) || searchTerm.includes(normalizeText(keyword))
          );
          return groupMatches && normalizeText(ex.muscle_group).includes(group);
        });
        
        const matchesSearch = nameMatch || synonymMatch || groupMatch;
        
        // Se o filtro é 'all', retorna tudo que match a busca
        if (muscleGroupFilter === 'all') {
          return matchesSearch;
        }
        
        // Verifica se o muscle_group do exercício corresponde ao filtro selecionado
        const filterKeywords = muscleGroupMapping[muscleGroupFilter] || [muscleGroupFilter];
        const matchesGroup = filterKeywords.some(keyword => 
          exerciseGroup.includes(normalizeText(keyword))
        );
        
        return matchesSearch && matchesGroup;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const pendingCount = files.filter(f => f.status === 'pending' && f.selectedExerciseId).length;
  const successCount = files.filter(f => f.status === 'success').length;

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
          dragActive 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border bg-muted/30 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/gif"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Upload className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            Arraste seus GIFs aqui
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            ou clique no botão abaixo para selecionar
          </p>
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            variant="default"
            className="gap-2"
          >
            <FileImage className="w-4 h-4" />
            Selecionar Arquivos
          </Button>
        </div>
      </div>

      {/* Stats */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-primary">{files.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-500">{successCount}</div>
            <div className="text-sm text-muted-foreground">Enviados</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-500">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Prontos</div>
          </Card>
        </div>
      )}

      {/* Muscle Group Filter */}
      {files.length > 0 && (
        <div className="flex items-center gap-2">
          <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {muscleGroups.map(group => (
                <SelectItem key={group.value} value={group.value}>
                  {group.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <ScrollArea className="h-[400px] rounded-lg border bg-card">
          <div className="p-4 space-y-3">
            {files.map((file, index) => (
              <Card 
                key={index} 
                className={`p-4 transition-all ${
                  file.status === 'success' ? 'border-green-500/50 bg-green-500/5' :
                  file.status === 'error' ? 'border-destructive/50 bg-destructive/5' :
                  file.status === 'uploading' ? 'border-blue-500/50 bg-blue-500/5' :
                  'border-border'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {file.preview ? (
                      <img src={file.preview} alt={file.fileName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileImage className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      
                      {/* Status Icon */}
                      <div className="flex items-center gap-2">
                        {file.status === 'success' && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                        {file.status === 'uploading' && (
                          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                        )}
                        {file.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Exercise Selection */}
                    {file.status === 'pending' && (
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar por nome ou grupo muscular..."
                            value={file.searchTerm || ''}
                            onChange={(e) => updateFileSearchTerm(index, e.target.value)}
                            className="pl-9 h-9"
                            disabled={isLoadingExercises}
                          />
                        </div>
                        
                        <Select
                          value={file.selectedExerciseId}
                          onValueChange={(value) => updateFileExercise(index, value)}
                          disabled={isLoadingExercises}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue 
                              placeholder={isLoadingExercises ? "Carregando exercícios..." : "Selecione o exercício"} 
                            />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {isLoadingExercises ? (
                              <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Carregando...
                              </div>
                            ) : getFilteredExercises(file).length === 0 ? (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                Nenhum exercício encontrado
                              </div>
                            ) : (
                              getFilteredExercises(file).map(exercise => (
                                <SelectItem key={exercise.id} value={exercise.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{exercise.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {exercise.muscle_group}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        
                        {file.selectedExerciseName && file.selectedExerciseName === findBestMatch(file.fileName)?.name && (
                          <Badge variant="secondary" className="text-xs w-fit">
                            ✓ Correspondência automática
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Error Message */}
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-destructive mt-2">{file.error}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Enviando...</span>
            <span className="font-medium">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex gap-3">
          <Button
            onClick={startUpload}
            disabled={uploading || pendingCount === 0}
            className="flex-1 gap-2"
            size="lg"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Enviar {pendingCount} GIF{pendingCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
          
          {!uploading && (
            <Button
              onClick={() => {
                files.forEach(f => {
                  if (f.preview) URL.revokeObjectURL(f.preview);
                });
                setFiles([]);
              }}
              variant="outline"
              size="lg"
            >
              Limpar Tudo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
