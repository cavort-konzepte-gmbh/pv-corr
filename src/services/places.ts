import { supabase } from '../lib/supabase';
import { SavedPlace } from '../components/PlacesPanel';
import { generateHiddenId } from '../utils/generateHiddenId';
import { toCase } from '../utils/cases';

export const fetchPlaces = async (): Promise<SavedPlace[]> => {
  try {
    const { data, error } = await supabase
      .from('places')
      .select(
        `
        id,
        hidden_id,
        name,
        country,
        street_number,
        street_name,
        apartment,
        city,
        state,
        postal_code,
        district,
        building,
        room,
        province,
        house_number
      `,
      )
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching places:', error);
      throw error;
    }

    return data.map((place) => {
      const toCamelCase = toCase<SavedPlace>(place, 'camelCase');
      return {
        ...toCamelCase,
        street_number: toCamelCase.street_number,
        house_number: toCamelCase.house_number,
        street_name: toCamelCase.street_name,
        postal_code: toCamelCase.postal_code,
      };
    });
  } catch (err) {
    console.error('Error in fetchPlaces:', err);
    throw new Error('Failed to fetch places');
  }
};

export const createPlace = async (place: Omit<SavedPlace, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('places')
      .insert({
        hidden_id: generateHiddenId(),
        name: place.name,
        country: place.country,
        street_number: place.street_number || null,
        street_name: place.street_name || null,
        apartment: place.apartment || null,
        city: place.city,
        state: place.state || null,
        postal_code: place.postal_code || null,
        district: place.district || null,
        building: place.building || null,
        room: place.room || null,
        province: place.province || null,
        house_number: place.house_number || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating place:', err);
    throw err;
  }
};

export const updatePlace = async (id: string, place: Partial<SavedPlace>) => {
  try {
    const { data, error } = await supabase
      .from('places')
      .update({
        name: place.name,
        street_number: place.street_number || null,
        street_name: place.street_name || null,
        apartment: place.apartment || null,
        city: place.city,
        state: place.state || null,
        postal_code: place.postal_code || null,
        district: place.district || null,
        building: place.building || null,
        room: place.room || null,
        province: place.province || null,
        house_number: place.house_number || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating place:', err);
    throw err;
  }
};

export const deletePlace = async (id: string) => {
  try {
    const { error } = await supabase.from('places').delete().eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error('Error deleting place:', err);
    throw err;
  }
};
