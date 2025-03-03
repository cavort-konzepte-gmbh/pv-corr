import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabaseMedia = (id: string) => {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadMedia = async (file: File, entity_id: string , name: string , description : string) => {
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
    console.log('file', name , description);
  
    const { data: mediaAssetData, error: mediaAssetError } = await supabase
      .from("media_assets")
      .insert([{ url: publicUrlData.publicUrl , type: "example" , title: name , description }])
      .select()
      .single();
    if (mediaAssetError || !mediaAssetData) {
      console.error("Error al insertar la URL en la tabla media_assets:", mediaAssetError?.message);
      setLoading(false);
      return;
    }
    const { error: mediaLinkError } = await supabase
      .from("media_links")
      .insert([{ media_id: mediaAssetData.id, entity_type: 'datapoint' ,entity_id }]);
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

export const fetchMediaUrlsByEntityId = async (entityId: string): Promise<{ url: string, title: string, description: string }[]> => {
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
    .select('url, title, description')
    .in('id', mediaIds);

  if (mediaError) {
    throw new Error('Failed to fetch media assets');
  }

  return mediaData;
};

export const updateMedia = async (mediaId: string, newTitle: string, newDescription: string) => {
  const { data, error } = await supabase
    .from('media_assets')
    .update({ title: newTitle, description: newDescription })
    .eq('url', mediaId);

  if (error) {
    throw new Error('Failed to update media');
  }

  return data;
};

export const deleteMedia = async (url: string) => {
  const { data: mediaData, error: mediaError } = await supabase
    .from('media_assets')
    .select('id')
    .eq('url', url)
    .single();

  if (mediaError || !mediaData) {
    throw new Error('Failed to fetch media asset');
  }

  const { error: deleteLinkError } = await supabase
    .from('media_links')
    .delete()
    .eq('media_id', mediaData.id);

  if (deleteLinkError) {
    throw new Error('Failed to delete media link');
  }

  const { error: deleteAssetError } = await supabase
    .from('media_assets')
    .delete()
    .eq('id', mediaData.id);

  if (deleteAssetError) {
    throw new Error('Failed to delete media asset');
  }

  const filePath = url.split('/').pop();
  if (!filePath) {
    throw new Error('Invalid file path');
  }
  const { error: deleteFileError } = await supabase.storage
    .from('media')
    .remove([filePath]);

  if (deleteFileError) {
    throw new Error('Failed to delete media file');
  }
};