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
    // Prepare update data - only include fields that are provided
    const updateData: Record<string, any> = {};
    if (zone.name !== undefined) updateData.name = zone.name;
    if (zone.latitude !== undefined) updateData.latitude = zone.latitude;
    if (zone.longitude !== undefined) updateData.longitude = zone.longitude;

    // Update the zone
    const { data, error } = await supabase
      .from('zones')
      .update(updateData)
      .eq('id', zoneId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Zone not found');
    }

    // Fetch complete zone data after update
    const { data: completeZone, error: fetchError } = await supabase
      .from('zones')
      .select(`
        *,
        datapoints (*)
      `)
      .eq('id', zoneId)
      .single();

    if (fetchError) {
      throw new Error('Failed to fetch updated zone data');
    }
    
    if (!completeZone) {
      throw new Error('Failed to retrieve updated zone data');
    }

    return completeZone;
  } catch (error) {
    console.error('Error updating zone:', error);
    throw error instanceof Error 
      ? error 
      : new Error('An unexpected error occurred while updating the zone');
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