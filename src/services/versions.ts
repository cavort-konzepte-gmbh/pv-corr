import { supabase } from "../lib/supabase";

export interface Version {
  id: string;
  version: string;
  is_beta: boolean;
  major: number;
  minor: number;
  patch: number;
  releaseDate: string;
  githubReleaseUrl?: string;
  link?: string;
  is_current?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export const getCurrentVersion = async (): Promise<Version | null> => {
  try {
    // First try to get the current version
    const { data: currentVersion, error: currentError } = await supabase
      .from("versions")
      .select("*")
      .eq("is_current", true)
      .maybeSingle();

    if (currentError) throw currentError;

    // If we found a current version, return it
    if (currentVersion) return currentVersion;

    // If no current version exists, get the latest version and set it as current
    const { data: latestVersion, error: latestError } = await supabase
      .from("versions")
      .select("*")
      .order("major", { ascending: false })
      .order("minor", { ascending: false })
      .order("patch", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) throw latestError;

    // If we found a latest version, set it as current and return it
    if (latestVersion) {
      const { error: updateError } = await supabase
        .from("versions")
        .update({ is_current: true })
        .eq("id", latestVersion.id);

      if (updateError) throw updateError;

      return { ...latestVersion, is_current: true };
    }

    // If no versions exist at all, return null
    return null;
  } catch (err) {
    console.error("Error fetching current version:", err);
    return null;
  }
};

export const getAllVersions = async (): Promise<Version[]> => {
  try {
    const { data, error } = await supabase
      .from("versions")
      .select("*")
      .order("major", { ascending: false })
      .order("minor", { ascending: false })
      .order("patch", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching versions:", err);
    return [];
  }
};

export const createVersion = async (version: {
  version: string;
  is_beta: boolean;
  major: number;
  minor: number;
  patch: number;
  githubReleaseUrl?: string;
  link?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from("versions")
      .insert({
        ...version,
        is_current: true, // This will automatically set other versions to false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error creating version:", err);
    throw err;
  }
};