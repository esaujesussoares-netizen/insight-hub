import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera } from "lucide-react";

interface AddBodyPhotoDialogProps {
  onUpload: (file: File, photoType: 'front' | 'back' | 'side', weight?: number, notes?: string) => void;
  trigger: React.ReactNode;
}

export const AddBodyPhotoDialog = ({ onUpload, trigger }: AddBodyPhotoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [photoType, setPhotoType] = useState<'front' | 'back' | 'side'>('front');
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    
    onUpload(
      file,
      photoType,
      weight ? parseFloat(weight) : undefined,
      notes || undefined
    );
    
    setOpen(false);
    setFile(null);
    setPreview("");
    setPhotoType('front');
    setWeight("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Foto de Progresso</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Foto</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Clique para selecionar</p>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-4"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Foto</Label>
            <Select value={photoType} onValueChange={(value: any) => setPhotoType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="front">Frontal</SelectItem>
                <SelectItem value="back">Costas</SelectItem>
                <SelectItem value="side">Lateral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Peso no momento (kg) - Opcional</Label>
            <Input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ex: 77.5"
            />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre o progresso..."
            />
          </div>

          <Button onClick={handleSubmit} disabled={!file} className="w-full">
            Adicionar Foto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
