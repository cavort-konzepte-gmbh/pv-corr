import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabaseMedia = (id: string) => {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadMedia = async (file: File, datapointId: string) => {
    setLoading(true);
    const filePath = `${id}/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("media")
      .upload(filePath, file);
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
      .insert([{ url: publicUrlData.publicUrl , type: "example" }])
      .select()
      .single();
    if (mediaAssetError || !mediaAssetData) {
      console.error("Error al insertar la URL en la tabla media_assets:", mediaAssetError?.message);
      setLoading(false);
      return;
    }
    const { error: mediaLinkError } = await supabase
      .from("media_links")
      .insert([{ media_id: mediaAssetData.id, entity_type: 'datapoint' ,entity_id:datapointId}]);
    if (mediaLinkError) {
      console.error("Error al insertar la URL en la tabla media_links:", mediaLinkError.message);
      setLoading(false);
      return;
    }
    setMediaUrl(publicUrlData.publicUrl);
    setLoading(false);
  };

  return { mediaUrl, uploadMedia, loading };
};

export const fetchMedia = async (folderPath: string): Promise<string[]> => {
  folderPath = 'zone-data-points';
  const { data, error } = await supabase.storage
    .from('media')
    .list(folderPath);

  if (error) {
    throw new Error('Failed to fetch media');
  }

  const urls = await Promise.all(
    data.map(async (file) => {
      const { data: publicUrlData } = supabase.storage
        .from('media')
        .getPublicUrl(`${folderPath}/${file.name}`);

      if (!publicUrlData) {
        throw new Error('Error al obtener la URL pública');
      }

      return publicUrlData.publicUrl;
    })
  );

  return urls;
};

export const fetchMediaUrlsByEntityId = async (entityId: string): Promise<string[]> => { 
     const { data, error } = await supabase
    .from('media_links')
    .select('media_id')
    .eq('entity_id', entityId);

  if (error) {
    throw new Error('Failed to fetch media links');
  }

  const mediaIds = data.map(link => link.media_id);


  const { data: mediaData, error: mediaError } = await supabase
    .from('media_assets')
    .select('url')
    .in('id', mediaIds);

  if (mediaError) {
    throw new Error('Failed to fetch media assets');
  }

  const urls = mediaData.map(asset => asset.url);

  return urls;
};
