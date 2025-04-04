import { useState } from "react";
import { supabase } from "../lib/supabase";

type ProgressCallback = (progress: number) => void;

export const useSupabaseMedia = (id: string) => {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadMedia = async (file: File, entity_id: string, name: string, description: string, onProgress?: ProgressCallback) => {
    setLoading(true);
    const filePath = `${id}/${Date.now()}-${file.name}`;

    // Upload with progress tracking
    const { data, error } = await supabase.storage.from("media").upload(filePath, file, {
      onUploadProgress: (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        onProgress?.(percent);
      },
    });

    if (error || !data) {
      console.error("Error al subir archivo:", error?.message);
      setLoading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(filePath);
    if (!publicUrlData) {
      console.error("No se pudo obtener la URL pública.");
      setLoading(false);
      return;
    }

    const { data: mediaAssetData, error: mediaAssetError } = await supabase
      .from("media_assets")
      .insert([{ url: publicUrlData.publicUrl, type: "example", title: name, description, entity_type: "datapoint", entity_id }])
      .select()
      .single();
    if (mediaAssetError || !mediaAssetData) {
      console.error("Error al insertar la URL en la tabla media_assets:", mediaAssetError?.message);
      setLoading(false);
      return;
    }

    setMediaUrl(publicUrlData.publicUrl);
    setLoading(false);
  };

  return { mediaUrl, uploadMedia, loading };
};

export const fetchMediaUrlsByEntityId = async (entityId: string): Promise<{ url: string; title: string; description: string }[]> => {
  const { data, error } = await supabase.from("media_assets").select("url, title, description").eq("entity_id", entityId);

  if (error) {
    throw new Error("Failed to fetch media assets");
  }

  return data;
};

export const updateMedia = async (mediaId: string, newTitle: string, newDescription: string) => {
  const { data, error } = await supabase.from("media_assets").update({ title: newTitle, description: newDescription }).eq("url", mediaId);

  if (error) {
    throw new Error("Failed to update media");
  }

  return data;
};

export const deleteMedia = async (url: string) => {
  const { data: mediaData, error: mediaError } = await supabase.from("media_assets").select("id").eq("url", url).single();

  if (mediaError || !mediaData) {
    throw new Error("Failed to fetch media asset");
  }

  const { error: deleteAssetError } = await supabase.from("media_assets").delete().eq("id", mediaData.id);

  if (deleteAssetError) {
    throw new Error("Failed to delete media asset");
  }

  const filePath = url.split("/").pop();
  if (!filePath) {
    throw new Error("Invalid file path");
  }
  const { error: deleteFileError } = await supabase.storage.from("media").remove([filePath]);

  if (deleteFileError) {
    throw new Error("Failed to delete media file");
  }
};
