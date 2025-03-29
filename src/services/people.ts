import { supabase } from '../lib/supabase';
import { Person } from '../types/people';
import { toCase } from '../utils/cases';
export const fetchPeople = async (): Promise<Person[]> => {
  try {
    const { data, error } = await supabase
      .from('people')
      .select(
        `
        id,
        hidden_id,
        salutation,
        title,
        first_name,
        last_name,
        email,
        phone
      `,
      )
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error in fetchPeople:', error);
      return [];
    }
    return data.map((person) => toCase<Person>(person, 'camelCase'));
  } catch (err) {
    console.error('Error in fetchPeople:', err);
    throw new Error('Failed to fetch people');
  }
};
