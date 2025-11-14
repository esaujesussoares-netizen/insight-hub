import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/untyped";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface BodyPhoto {
  id: string;
  photo_date: string;
  photo_url: string;
  photo_type: 'front' | 'back' | 'side';
  weight_at_photo?: number;
  notes?: string;
}

export const useBodyPhotos = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<BodyPhoto[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPhotos = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('body_photos')
      .select('*')
      .eq('user_id', user.id)
      .order('photo_date', { ascending: false });

    if (error) {
      console.error('Error loading photos:', error);
    } else if (data) {
      setPhotos(data);
    }
    setLoading(false);
  };

  const uploadPhoto = async (
    file: File,
    photoType: 'front' | 'back' | 'side',
    weight?: number,
    notes?: string
  ) => {
    if (!user) return;

    try {
      // Upload da imagem para o storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('body-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('body-photos')
        .getPublicUrl(fileName);

      // Salvar referência no banco
      const { error: dbError } = await supabase
        .from('body_photos')
        .insert({
          user_id: user.id,
          photo_url: publicUrl,
          photo_type: photoType,
          weight_at_photo: weight,
          notes: notes
        });

      if (dbError) throw dbError;

      toast.success("Foto adicionada com sucesso!");
      loadPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error("Erro ao fazer upload da foto");
    }
  };

  const deletePhoto = async (id: string, photoUrl: string) => {
    try {
      // Extrair o caminho do arquivo da URL
      const path = photoUrl.split('/body-photos/')[1];
      
      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('body-photos')
        .remove([path]);

      if (storageError) throw storageError;

      // Deletar do banco
      const { error: dbError } = await supabase
        .from('body_photos')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      toast.success("Foto excluída!");
      loadPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error("Erro ao excluir foto");
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [user]);

  return {
    photos,
    loading,
    uploadPhoto,
    deletePhoto,
    refreshData: loadPhotos
  };
};
