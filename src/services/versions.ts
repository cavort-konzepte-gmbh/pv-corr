import { supabase } from '../lib/supabase';

export interface Version {
  id: string;
  version: string;
  major: number;
  minor: number;
  patch: number;
  releaseDate: string;
  githubReleaseUrl?: string;
  changelog: ChangelogEntry[];
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface ChangelogEntry {
  type: 'feature' | 'fix' | 'improvement' | 'breaking';
  title: string;
  description: string;
  component?: string;
}

export const getCurrentVersion = async (): Promise<Version | null> => {
  try {
    const { data, error } = await supabase
      .from('versions')
      .select('*')
      .eq('is_current', true)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching current version:', err);
    return null;
  }
};

export const getAllVersions = async (): Promise<Version[]> => {
  try {
    const { data, error } = await supabase
      .from('versions')
      .select('*')
      .order('major', { ascending: false })
      .order('minor', { ascending: false })
      .order('patch', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching versions:', err);
    return [];
  }
};

export const createVersion = async (version: {
  version: string;
  major: number;
  minor: number;
  patch: number;
  githubReleaseUrl?: string;
  changelog: ChangelogEntry[];
}) => {
  try {
    const { data, error } = await supabase
      .from('versions')
      .insert({
        ...version,
        is_current: true // This will automatically set other versions to false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating version:', err);
    throw err;
  }
};