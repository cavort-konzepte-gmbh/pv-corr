import { supabase } from '../lib/supabase';
import { Person } from '../types/people';
import { toCase } from '../utils/cases';

export const fetchPeople = async (): Promise<Person[]> => {
  try {
    const { data, error } = await supabase
      .from('people')
      .select(`
        id,
        hidden_id,
        salutation,
        title,
        first_name,
        last_name,
        email,
        phone,
        private_address_id,
        business_address_id
      `)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching people:', error);
      throw error;
    }

    return data.map(person => {
      const toCamelCase = toCase<Person>(person, "camelCase");
      return { 
        ...toCamelCase, 
        addresses: { 
          private: person.private_address_id, 
          business: person.business_address_id 
        } 
      };
    })
  } catch (err) {
    console.error('Error in fetchPeople:', err);
    throw new Error('Failed to fetch people');
  }
};