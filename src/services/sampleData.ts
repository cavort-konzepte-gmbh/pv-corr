import { supabase } from '../lib/supabase';
import { SavedPlace } from '../components/PlacesPanel';
import { SavedPerson } from '../utils/sampleData';
import { Company } from '../types/companies';
import { Project } from '../types/projects';

export const loadSamplePlaces = async (): Promise<SavedPlace[]> => {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading places:', error);
    return [];
  }

  return data.map(place => ({
    id: place.id,
    hiddenId: place.hidden_id,
    country: place.country,
    values: place.values
  }));
};

export const loadSamplePeople = async (): Promise<SavedPerson[]> => {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading people:', error);
    return [];
  }

  return data.map(person => ({
    id: person.id,
    hiddenId: person.hidden_id,
    values: person.values,
    addresses: {
      private: person.private_address_id,
      business: person.business_address_id
    }
  }));
};

export const loadSampleCompanies = async (): Promise<Company[]> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading companies:', error);
    return [];
  }

  return data.map(company => ({
    id: company.id,
    hiddenId: company.hidden_id,
    name: company.name,
    website: company.website,
    email: company.email,
    phone: company.phone,
    vatId: company.vat_id,
    registrationNumber: company.registration_number,
    placeId: company.place_id,
    ceoId: company.ceo_id,
    contactPersonId: company.contact_person_id
  }));
};

export const loadSampleProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('user_projects')
    .select(`project:projects (
      *,
      fields:fields (
        *,
        gates:gates (*),
        zones:zones (*)
      )
    )`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading projects:', error);
    return [];
  }

  return data.map(({ project }) => ({
    id: project.id,
    hiddenId: project.hidden_id,
    name: project.name,
    placeId: project.place_id,
    companyId: project.company_id,
    clientRef: project.client_ref,
    latitude: project.latitude,
    longitude: project.longitude,
    imageUrl: project.image_url,
    managerId: project.manager_id,
    fields: project.fields.map((field: any) => ({
      id: field.id,
      hiddenId: field.hidden_id,
      name: field.name,
      latitude: field.latitude,
      longitude: field.longitude,
      gates: field.gates.map((gate: any) => ({
        id: gate.id,
        hiddenId: gate.hidden_id,
        name: gate.name,
        latitude: gate.latitude,
        longitude: gate.longitude
      })),
      zones: field.zones.map((zone: any) => ({
        id: zone.id,
        hiddenId: zone.hidden_id,
        name: zone.name,
        latitude: zone.latitude,
        longitude: zone.longitude,
        datapoints: []
      }))
    }))
  }));
};