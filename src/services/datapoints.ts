import { supabase } from '../lib/supabase';
import { generateHiddenId } from '../utils/generateHiddenId';
import { Datapoint } from '../types/projects';

export const deleteDatapoint = async (datapointId: string) => {
  try {
    const { error } = await supabase.from('datapoints').delete().eq('id', datapointId);

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error('Error deleting datapoint:', err);
    throw err;
  }
};

export const updateDatapoint = async (
  datapointId: string,
  data: {
    values: Record<string, string>;
    name?: string;
  },
) => {
  try {
    if (!data.name?.trim()) {
      throw new Error('Name is required');
    }

    const updateData = {
      values: data.values,
      name: data.name.trim(),
      updated_at: new Date().toISOString(),
    };

    const { data: updatedDatapoint, error } = await supabase.from('datapoints').update(updateData).eq('id', datapointId).select().single();

    if (error) {
      throw error;
    }

    return updatedDatapoint;
  } catch (err) {
    console.error('Error updating datapoint:', err);
    throw err;
  }
};

export const createDatapoint = async (
  zoneId: string,
  data: {
    type: string;
    name: string;
    values: Record<string, string>;
    ratings: Record<string, number>;
  },
) => {
  try {
    // First verify the zone exists
    const { data: zone, error: zoneError } = await supabase.from('zones').select('id').eq('id', zoneId).single();

    if (zoneError) {
      throw new Error('Zone not found');
    }

    const { data: newDatapoint, error } = await supabase
      .from('datapoints')
      .insert({
        zone_id: zoneId,
        hidden_id: generateHiddenId(),
        name: data.name.trim(),
        type: data.type,
        values: data.values,
        ratings: data.ratings,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating datapoint:', error.message);
      throw error;
    }

    return newDatapoint;
  } catch (err) {
    console.error('Error in createDatapoint:', err instanceof Error ? err.message : err);
    throw err;
  }
};

export const fetchDatapointsByZoneId = async (zoneId: string): Promise<Datapoint[]> => {
  try {
    const { data, error } = await supabase.from('datapoints').select().eq('zone_id', zoneId);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching datapoints:', err);
    throw err;
  }
};
