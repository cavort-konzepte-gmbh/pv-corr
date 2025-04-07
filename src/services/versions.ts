import { supabase } from '../lib/supabase';

export interface Version {
  id: string;
  version: string;
  is_beta: boolean;
  major: number;
  minor: number;
  patch: number;
  release_date?: string;
  github_release_url?: string;
  link?: string;
  is_current?: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  changelog?: Array<{
    type: "feature" | "fix" | "improvement" | "breaking";
    description: string;
  }>;
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

    if (currentVersion) return currentVersion;

    // If no current version is found, get the latest version
    const { data: latestVersion, error: latestError } = await supabase
      .from("versions")
      .select("*")
      .order("major", { ascending: false })
      .order("minor", { ascending: false })
      .order("patch", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) throw latestError;

    if (latestVersion) {
      // Set this as the current version
      try {
        const { error: updateError } = await supabase
          .from("versions")
          .update({ is_current: true })
          .eq("id", latestVersion.id);

        if (updateError) console.warn("Could not set current version:", updateError);
      } catch (err) {
        console.warn("Error updating current version:", err);
      }

      return latestVersion;
    }

    return null;
  } catch (err) {
    console.error("Error fetching current version:", err);
    return null;
  }
};

export const getAllVersions = async () => {
  const { data, error } = await supabase
    .from('versions')
    .select('*');

  if (error) throw error;
  
  // Sort versions by semantic versioning
  return data.sort((a, b) => {
    if (a.major !== b.major) return b.major - a.major;
    if (a.minor !== b.minor) return b.minor - a.minor;
    return b.patch - a.patch;
  });
};

export const createVersion = async (versionData: {
  version: string;
  major: number;
  minor: number;
  patch: number;
  is_beta: boolean;
  changelog?: Array<{
    type: string;
    description: string;
  }>;
}) => {
  try {
    // Check if version already exists
    const { data: existingVersion, error: checkError } = await supabase
      .from('versions')
      .select('id')
      .eq('version', versionData.version)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    if (existingVersion) {
      throw new Error(`Version ${versionData.version} already exists`);
    }
    
    // If there are no versions, make this one current
    const { count, error: countError } = await supabase
      .from('versions')
      .select('id', { count: 'exact', head: true });
      
    if (countError) throw countError;
    
    const isFirstVersion = count === 0;
    
    // Insert the new version
    const { data, error } = await supabase
      .from('versions')
      .insert({
        ...versionData,
        is_current: isFirstVersion, // Make it current if it's the first version
        link: "https://github.com/cavort-konzepte-gmbh/pv-corr/blob/main/CHANGELOG.md"
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

export const updateVersion = async (id: string, updateData: Partial<Version>) => {
  // First check if the version exists
  const { data: existingVersion, error: checkError } = await supabase
    .from("versions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
    
  if (checkError) {
    throw new Error(`Version not found: ${checkError.message}`);
  }
  
  if (!existingVersion) {
    throw new Error(`Version with ID ${id} not found`);
  }
  
  // Then update the version
  const { error } = await supabase
    .from('versions')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error("Error updating version:", error);
    throw error;
  }
  
  // Return the updated version
  const { data: updatedVersion, error: fetchError } = await supabase
    .from('versions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (fetchError) {
    console.error("Error fetching updated version:", fetchError);
    throw fetchError;
  }
  
  if (!updatedVersion) {
    throw new Error(`Updated version with ID ${id} not found`);
  }
  
  return updatedVersion;
};

export const deleteVersion = async (id: string) => {
  // First check if the version exists and is not current
  const { data: version, error: checkError } = await supabase
    .from("versions")
    .select("is_current")
    .eq("id", id)
    .maybeSingle();
    
  if (checkError) {
    throw new Error(`Version not found: ${checkError.message}`);
  }
  
  if (!version) {
    throw new Error(`Version with ID ${id} not found`);
  }
  
  if (version.is_current) {
    throw new Error('Cannot delete the current version');
  }
  
  const { error } = await supabase
    .from('versions')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};