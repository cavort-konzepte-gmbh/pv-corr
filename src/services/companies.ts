import { supabase } from '../lib/supabase';
import { Company } from '../types/companies';
import { toCase } from '../utils/cases';
export const fetchCompanies = async (): Promise<Company[]> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(
        `
        id,
        hidden_id,
        name,
        website,
        email,
        phone,
        vat_id,
        registration_number,
        ceo_id,
        contact_person_id
      `,
      )
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
    return data.map((company) => toCase<Company>(company, 'camelCase'));
  } catch (error) {
    console.error('Error in fetchCompanies:', error);
    throw new Error('Failed to fetch companies');
  }
};
