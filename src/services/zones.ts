import { supabase } from '../lib/supabase';
import { Zone } from '../types/projects';
import { generateHiddenId } from '../utils/generateHiddenId';

export const createZone = async (fieldId: string, zone: Omit<Zone, 'id' | 'hiddenId' | 'datapoints'>) => {
  if (!fieldId) {
    throw new Error('Field ID is required');
  }

  // First check if field exists
  const { data: field, error: fieldError } = await supabase
    .from('fields')
    .select('id')
    .eq('id', fieldId)
    .single();

  if (fieldError) {
    console.error('Error finding field:', fieldError);
    throw fieldError;
  }

  const { data, error } = await supabase
    .from('zones')
    .insert({
      field_id: fieldId,
      hidden_id: generateHiddenId(),
      name: zone.name,
      latitude: zone.latitude,
      longitude: zone.longitude
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating zone:', error);
    throw error;
  }
  
  // Fetch complete zone data after creation
  const { data: completeZone, error: fetchError } = await supabase
    .from('zones')
    .select(`
      *,
      datapoints (*)
    `)
    .eq('id', data.id)
    .single();

  if (fetchError) {
    console.error('Error fetching complete zone:', fetchError);
    throw fetchError;
  }

  return completeZone;
};

export const updateZone = async (zoneId: string, zone: Partial<Zone>): Promise<Zone> => {
  if (!zoneId) {
    throw new Error('Zone ID is required for update');
  }
  
  try {
    // Prepare update data - ensure name is preserved
    const updateData: Record<string, any> = {
      name: zone.name,
      latitude: zone.latitude || null,
      longitude: zone.longitude || null,
      substructure_id: zone.substructureId === '' ? null : zone.substructureId || null,
      foundation_id: zone.foundationId === '' ? null : zone.foundationId || null
    };

    // Update zone
    const { data, error } = await supabase
      .from('zones')
      .update(updateData)
      .eq('id', zoneId)
      .select(`
        *,
        datapoints (*)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating zone:', err);
    throw err;
  }
};

export const deleteZone = async (zoneId: string) => {
  const { error } = await supabase
    .from('zones')
    .delete()
    .eq('id', zoneId);

  if (error) {
    console.error('Error deleting zone:', error);
    throw error;
  }
};