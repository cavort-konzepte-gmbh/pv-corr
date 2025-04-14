import { useState } from "react";
import { supabase } from "../lib/supabase";
import { handleSupabaseError } from "../lib/supabase";

type ProgressCallback = (progress: number) => void;

export const useSupabaseMedia = (entityType: string) => {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadMedia = async (
    file: File,
    entity_id: string,
    title: string,
    description: string,
    onProgress?: ProgressCallback,
    mediaType?: string, // Optional parameter to override auto-detection
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Create a unique file path
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `${entityType}/${entity_id}/${timestamp}-${randomString}-${safeFileName}`;

      // Upload with progress tracking
      const { data, error: uploadError } = await supabase.storage.from("media").upload(filePath, file, {
        onUploadProgress: (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          onProgress?.(percent);
        },
        cacheControl: "3600",
        contentType: file.type, // Explicitly set the content type
      });

      if (uploadError) {
        throw new Error(`Upload error: ${uploadError.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(filePath);
      if (!publicUrlData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // Determine media type based on file extension if not provided
      if (!mediaType) {
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "";

        if (["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp", "tiff"].includes(fileExt)) {
          mediaType = "photo";
        } else if (["mp4", "webm", "mov", "avi", "mkv", "flv"].includes(fileExt)) {
          mediaType = "video";
        } else {
          mediaType = "document"; // Default to document for unknown types
        }
      }

      // Save media metadata to database
      const { data: mediaAssetData, error: mediaAssetError } = await supabase
        .from("media_assets")
        .insert([
          {
            url: publicUrlData.publicUrl,
            type: mediaType,
            title: title || file.name,
            description: description || `Uploaded on ${new Date().toLocaleString()}`,
            entity_type: entityType,
            entity_id,
          },
        ])
        .select()
        .single();

      if (mediaAssetError) {
        throw new Error(`Database error: ${mediaAssetError.message}`);
      }

      setMediaUrl(publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (err) {
      console.error("Media upload error:", err);
      setError(err instanceof Error ? err.message : "Unknown upload error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mediaUrl, uploadMedia, loading, error };
};

export const fetchMediaUrlsByEntityId = async (
  entityId: string,
): Promise<{ url: string; title: string; description: string; type: string; createdAt: string }[]> => {
  try {
    const { data, error } = await supabase
      .from("media_assets")
      .select("url, title, description, type, created_at")
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false });

    if (error) {
      handleSupabaseError(error);
    }

    return data.map((item) => ({
      url: item.url,
      title: item.title || "",
      description: item.description || "",
      type: item.type || "document",
      createdAt: item.created_at,
    }));
  } catch (err) {
    console.error("Error fetching media:", err);
    throw new Error("Failed to fetch media assets");
  }
};

export const updateMedia = async (url: string, newTitle: string, newDescription: string) => {
  try {
    const { data, error } = await supabase
      .from("media_assets")
      .update({
        title: newTitle,
        description: newDescription,
      })
      .eq("url", url);

    if (error) {
      handleSupabaseError(error);
    }

    return data;
  } catch (err) {
    console.error("Error updating media:", err);
    throw new Error("Failed to update media");
  }
};

export const deleteMedia = async (url: string) => {
  try {
    // First get the media asset record
    const { data: mediaData, error: mediaError } = await supabase.from("media_assets").select("id").eq("url", url).single();

    if (mediaError) {
      handleSupabaseError(mediaError);
    }

    // Delete the database record
    const { error: deleteAssetError } = await supabase.from("media_assets").delete().eq("id", mediaData.id);

    if (deleteAssetError) {
      handleSupabaseError(deleteAssetError);
    }

    // Extract the storage path from the URL
    // The URL format is typically like: https://xxx.supabase.co/storage/v1/object/public/media/path/to/file
    const urlParts = url.split("/");
    const bucketIndex = urlParts.indexOf("media");

    if (bucketIndex === -1) {
      throw new Error("Invalid media URL format");
    }

    const storagePath = urlParts.slice(bucketIndex + 1).join("/");

    // Delete the file from storage
    const { error: deleteFileError } = await supabase.storage.from("media").remove([storagePath]);

    if (deleteFileError) {
      console.warn(`Warning: File may be deleted from database but not from storage: ${deleteFileError.message}`);
    }
  } catch (err) {
    console.error("Error in deleteMedia:", err);
    throw err;
  }
};

export const bulkDeleteMedia = async (urls: string[]) => {
  try {
    const deletePromises = urls.map((url) => deleteMedia(url));
    await Promise.all(deletePromises);
  } catch (err) {
    console.error("Error in bulkDeleteMedia:", err);
    throw new Error("Failed to delete some media files");
  }
};
