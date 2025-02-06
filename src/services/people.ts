import { supabase } from '../lib/supabase';
import { Person } from '../types/people';

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

    return data.map(person => ({
      id: person.id,
      hiddenId: person.hidden_id,
      salutation: person.salutation,
      title: person.title || '',
      firstName: person.first_name,
      lastName: person.last_name,
      email: person.email,
      phone: person.phone || '',
      addresses: {
        private: person.private_address_id,
        business: person.business_address_id
      }
    }));
  } catch (err) {
    console.error('Error in fetchPeople:', err);
    throw new Error('Failed to fetch people');
  }
};