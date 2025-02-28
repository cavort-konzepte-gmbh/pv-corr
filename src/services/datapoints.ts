import { supabase } from '../lib/supabase';
import { generateHiddenId } from '../utils/generateHiddenId';
import { Datapoint } from '../types/projects';

export const deleteDatapoint = async (datapointId: string) => {
  try {
    const { error } = await supabase
      .from('datapoints')
      .delete()
      .eq('id', datapointId);

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error('Error deleting datapoint:', err);
    throw err;
  }
};

export const updateDatapoint = async (datapointId: string, data: {
  values: Record<string, string>;
  sequential_id?: string;
}) => {
  try {
    const { data: updatedDatapoint, error } = await supabase
      .from('datapoints')
      .update(
        data.sequential_id
          ? {
              values: data.values,
              sequential_id: data.sequential_id,
              updated_at: new Date().toISOString()
            }
          : {
              values: data.values,
              updated_at: new Date().toISOString()
            }
      )
      .eq('id', datapointId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return updatedDatapoint;
  } catch (err) {
    console.error('Error updating datapoint:', err);
    throw err;
  }
};

interface DatapointData {
  type: string;
  values: Record<string, string>;
  ratings: Record<string, number>;
}

export const createDatapoint = async (zoneId: string, data: {
  type: string;
  values: Record<string, string>;
  ratings: Record<string, number>;
  sequentialId?: string;
}) => {
  try {
    // First verify the zone exists
    const { data: zone, error: zoneError } = await supabase
      .from('zones')
      .select('id')
      .eq('id', zoneId)
      .single();

    if (zoneError) {
      throw new Error('Zone not found');
    }

    const { data: newDatapoint, error } = await supabase
      .from('datapoints')
      .insert({
        zone_id: zoneId,
        hidden_id: generateHiddenId(),
        sequential_id: data.sequentialId || await generateSequentialId(zoneId),
        type: data.type,
        values: data.values,
        ratings: data.ratings,
        timestamp: new Date().toISOString()
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

// Helper function to generate sequential ID
async function generateSequentialId(zoneId: string): Promise<string> {
  const { data, error } = await supabase
    .from('datapoints')
    .select('sequential_id')
    .eq('zone_id', zoneId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error getting last sequential ID:', error);
    throw error;
  }

  const lastId = data?.[0]?.sequential_id;
  if (!lastId) return 'DP001';

  const numStr = lastId.replace('DP', '');
  const nextNum = parseInt(numStr, 10) + 1;
  return `DP${String(nextNum).padStart(3, '0')}`;
}


 export const fetchDatapointsByZoneId = async (zoneId: string): Promise<Datapoint[]> => {
  try {
    const { data, error } = await supabase
      .from('datapoints')
      .select()
      .eq('zone_id', zoneId);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching datapoints:', err);
    throw err;
  }}