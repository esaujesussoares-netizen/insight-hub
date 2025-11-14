import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/untyped";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface EditableAvatarProps {
  name: string;
  currentAvatarUrl?: string;
  onAvatarUpdate?: (newUrl: string) => void;
}

export const EditableAvatar = ({ name, currentAvatarUrl, onAvatarUpdate }: EditableAvatarProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const getInitials = () => {
    return name?.charAt(0)?.toUpperCase() || "U";
  };

  const validateFile = (file: File): boolean => {
    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem",
        variant: "destructive"
      });
      return false;
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsModalOpen(false);
    setIsPreviewOpen(true);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    setIsModalOpen(false);
  };

  const handleCameraClick = async () => {
    setIsModalOpen(false);
    setIsCameraMode(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera. Verifique as permissões.",
        variant: "destructive"
      });
      setIsCameraMode(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraMode(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Configurar canvas com dimensões do vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenhar frame do vídeo no canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converter para blob
    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
      
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      
      stopCamera();
      setIsPreviewOpen(true);
    }, 'image/jpeg', 0.95);
  };

  const handleSaveAvatar = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);

    try {
      // Deletar avatar anterior se existir
      if (currentAvatarUrl && currentAvatarUrl.includes('avatars')) {
        const oldPath = currentAvatarUrl.split("/avatars/").pop();
        if (oldPath) {
          await supabase.storage
            .from("avatars")
            .remove([oldPath]);
        }
      }

      // Upload do novo avatar
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Salvar no perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles' as any)
        .upsert({
          user_id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: 'user_id'
        } as any);

      if (profileError) throw profileError;

      toast({
        title: "Sucesso!",
        description: "Foto de perfil atualizada com sucesso"
      });
      
      onAvatarUpdate?.(publicUrl);
      setIsPreviewOpen(false);
      setPreviewUrl("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar foto de perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setSelectedFile(null);
    setIsPreviewOpen(false);
  };

  return (
    <>
      <div className="relative inline-block">
        <div 
          className="cursor-pointer group"
          onClick={() => setIsModalOpen(true)}
        >
          <Avatar className="w-20 h-20 md:w-24 md:h-24 ring-2 ring-primary/20 transition-all group-hover:ring-primary/40">
            <AvatarImage src={currentAvatarUrl} alt={name} />
            <AvatarFallback className="bg-gradient-hero text-white text-2xl md:text-3xl font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow-lg transition-transform group-hover:scale-110">
            <Camera className="w-3 h-3 md:w-4 md:h-4" />
          </div>
        </div>
      </div>

      {/* Modal de Seleção */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar foto de perfil</DialogTitle>
            <DialogDescription>
              Escolha como deseja adicionar sua foto
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 text-base hover:bg-primary/10"
              onClick={handleUploadClick}
            >
              <Upload className="w-8 h-8" />
              <span>Fazer upload da galeria</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 text-base hover:bg-primary/10"
              onClick={handleCameraClick}
            >
              <Camera className="w-8 h-8" />
              <span>Tirar foto com a câmera</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Prévia da foto</DialogTitle>
            <DialogDescription>
              Confirme sua nova foto de perfil
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="relative">
              <Avatar className="w-32 h-32 md:w-40 md:h-40">
                <AvatarImage src={previewUrl} alt="Preview" />
              </Avatar>
            </div>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancelPreview}
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                variant="fitness"
                className="flex-1"
                onClick={handleSaveAvatar}
                disabled={isUploading}
              >
                {isUploading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Câmera */}
      <Dialog open={isCameraMode} onOpenChange={(open) => {
        if (!open) stopCamera();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tirar foto</DialogTitle>
            <DialogDescription>
              Posicione-se e clique em capturar
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={stopCamera}
              >
                Cancelar
              </Button>
              <Button
                variant="fitness"
                className="flex-1"
                onClick={capturePhoto}
              >
                <Camera className="w-4 h-4 mr-2" />
                Capturar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </>
  );
};
